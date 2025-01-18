require("dotenv").config();
const fetch = require("node-fetch");

class Scanner {
    constructor(file, options) {
        this.file = file;
        this.options = {
            virusTotal: options.virusTotal || false,
            byteScale: options.byteScale || false,
        };
    }

    scanFileforViruses = async () => {
        const result = {};

        // VirusTotal
        if (this.options.virusTotal) {
            result[virusTotalResult] = await scanFileThroughVirusTotal();
        }


        return result;
    }

    scanFileThroughVirusTotal = async () => {
        const formData = new FormData();
        formData.append('file', this.file);

        const options = {
            method: 'POST',
            headers: { accept: 'application/json', 'content-type': 'multipart/form-data', 'x-apikey': process.env.VIRUSTOTAL_API_KEY },
            body: formData,
        };

        const res = await fetch('https://www.virustotal.com/api/v3/files', options)
        console.log(res.json)

        return res.json();
    }
}

module.exports = Scanner;