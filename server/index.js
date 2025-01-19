const express = require('express');
const app = express();
const port = 3000;
const FileHandler = require('./getFile');
const Scanner = require('./scanner/index');
const cors = require('cors');

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/', async (req, res) => {
    res.send("Server is running");
});

app.post("/scan", async (req, res) => {
    const { url, options } = req.body;

    if (!url) {
        res.status(400).json({ error: "No URL provided" });
        return;
    }

    var scanner;
    const fileHandler = new FileHandler();
    var result = {
        stats: {
            malicious: 0,
            suspicious: 0,
            undetected: 1,
            harmless: 0,
            failed: 0
        }, viruses: []
    };
    let response;

    try {
        // Create File
        response = await fileHandler.downloadFile(url);

        // Defaulting virustotal to true for now, will change after we get list of software services to render done on UI
        scanner = new Scanner(response, { virusTotal: options?.virusTotal || true, cloudMersive: options?.cloudMersive || false, byteScale: options?.byteScale || false });
        result = await scanner.scanFileforViruses();

        console.log("Sending back results");
    } catch (e) { }

    if (scanner) delete scanner;
    if (response) fileHandler.clearFile(response.filepath); //Delete the file from cache
    res.status(200).json(result);
    return;
});

app.post("/scanurl", async (req, res) => {
    const { url, options } = req.body;

    if (!url) {
        res.status(400).json({ error: "No URL provided" });
        return;
    }

    var scanner;
    var result = {
        stats: {
            malicious: 0,
            suspicious: 0,
            undetected: 1,
            harmless: 0,
            failed: 0
        }
    };;

    try {
        scanner = new Scanner(null, { virusTotal: options?.virusTotal || true });
        result = await scanner.scanUrlForViruses(url);

        console.log("Sending back results");
        console.log(result);

    } catch (e) { }

    if (scanner) delete scanner;
    res.status(200).json(result);
    return;

})

const main = async () => {
    console.log("Starting server...");

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

main();





