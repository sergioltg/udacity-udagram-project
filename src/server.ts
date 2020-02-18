import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

    // Init the Express application
    const app = express();

    // Set the network port
    const port = process.env.PORT || 8082;

    // Use the body parser middleware for post requests
    app.use(bodyParser.json());

    // Root Endpoint
    // Displays a simple message to the user
    app.get("/", async (req, res) => {
        res.send("try GET /filteredimage?image_url={{}}")
    });

    /**
     *  endpoint to filter an image from a public url
     */
    app.get("/filteredimage", async (req, res) => {
        const imageUrl: string = req.query.image_url;
        if (!imageUrl) {
            return res.status(400).send({message: 'Parameter image_url is required'});
        }

        let tempFile: string;
        try {
            tempFile = await filterImageFromURL(imageUrl);
        } catch (err) {
            console.error(err);
            return res.status(500).send({message: 'Error processing image'});
        }

        res.sendFile(tempFile, function (err) {
            if (err) {
                console.error(err);
                res.status(500).end();
            }
            try {
                deleteLocalFiles([tempFile]);
            } catch (err) {
                console.log("error deleting file");
            }
        });
    });

    // Start the Server
    app.listen(port, () => {
        console.log(`server running http://localhost:${port}`);
        console.log(`press CTRL+C to stop server`);
    });
})();