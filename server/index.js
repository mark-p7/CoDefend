const express = require('express');
const app = express();
const port = 3000;
const FileHandler = require('./getFile');
const Scanner = require('./scanner/index');

app.get('/', async (req, res) => {
    res.send("Server is running");
});

app.post("/scan", async (req, res) => {

    const { url } = req.body;

    if (!url) {
        res.status(400).send("No URL provided");
        return;
    }

    const fileHandler = new FileHandler();

    const file = fileHandler.downloadFile(url);

    const scanner = new Scanner(file, { virusTotal: true });
    scanner.scanFileforViruses();

    res.send(result);
    fileHandler.clearFile()
});

const main = async () => {
    console.log("Starting server...");

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    // Create File
    const fileHandler = new FileHandler();
    const res = await fileHandler.downloadFile("https://images.pexels.com/photos/20263436/pexels-photo-20263436/free-photo-of-revel-atlantic-city-hotel-in-atlantic-city-in-usa.jpeg");
    const scanner = new Scanner(res, { virusTotal: true, cloudMersive: false, byteScale: false });
    scanner.scanFileforViruses();
    scanner.scanUrlThroughVirusTotal();

    fileHandler.clearFile(res.filepath);
}

main();





