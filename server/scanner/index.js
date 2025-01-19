require("dotenv").config({ path: '../.env' });
const fetch = require("node-fetch");
const FormData = require("form-data");

class Scanner {
    constructor(fileoptions, options) {
        this.fileblob = fileoptions.blob;
        this.filetype = fileoptions.type;
        this.filename = fileoptions.filepath.split("/").pop();
        this.options = {
            virusTotal: options.virusTotal || false,
            byteScale: options.byteScale || false,
            cloudMersive: options.cloudMersive || false,
        };
    }

    scanFileforViruses = async () => {
        const result = {};

        // VirusTotal
        if (this.options.virusTotal) {
            result["virusTotalResult"] = await this.scanFileThroughVirusTotal();
        }

        //Bytescale
        if (this.options.byteScale) {
            result["byteScaleResult"] = (await this.scanFileThroughBytescale()).files[0];
        }

        //CloudMersive
        if (this.options.cloudMersive) {
            result["cloudMersiveResult"] = await this.scanFileThroughCloudmersive();
        }


        return result;
    }

    /**
 * Get File/URL Analysis Report
 * @param {string} analysis_id Analysis ID returned by VirusTotal
 */
    async getVirusTotalAnalysis(analysis_id) {
        const options = {
            method: 'GET',
            headers: { accept: 'application/json', 'content-type': 'multipart/form-data', 'x-apikey': process.env.VIRUSTOTAL_API_KEY }
        };

        const res = await fetch('https://www.virustotal.com/api/v3/analyses/' + analysis_id, options);
        const data = (await res.json()).data.attributes;

        if (data.status == 'queued') {
            this.getVirusTotalAnalysis(analysis_id);
        } else return data;
    }

    scanFileThroughVirusTotal = async () => {
        // virustotal.postFiles({file: this.file})
        // .then(({ data }) => console.log(data))
        // .catch(err => console.error(err));
        const formData = new FormData();
        formData.append('file', await this._blobToBuffer(this.fileblob), { filename: this.filename, type: this.filetype.mime });

        const options = {
            method: 'POST',
            headers: { accept: 'application/json', 'x-apikey': process.env.VIRUS_TOTAL_API_KEY },
            body: formData
        };

        const res = await fetch('https://www.virustotal.com/api/v3/files', options);
        const analysis_id = (await res.json()).data.id;
        const analysis = await this._getVirusTotalAnalysis(analysis_id);

        console.log(analysis)

        return analysis;
    }

    // scanFileThroughCloudmersive = async () => {
    //     const formData = new FormData();
    //     formData.append('inputFile', this.file);

    //     console.log(formData)
    //     const options = {
    //         method: 'POST',
    //         headers: { accept: 'application/json', 'content-type': 'multipart/form-data', 'Apikey': process.env.CLOUDMERSIVE_API_KEY },
    //         formData: formData
    //     };

    //     const res = await fetch('https://api.cloudmersive.com/virus/scan/file', options)
    //     if (!res.ok) console.log(await res.text());
    //     const result = await res.json();
    //     console.log(result)
    //     return result;
    // }

    scanUrlThroughVirusTotal = async (url) => {
        if (!url) return "No URL Provided";
        const options = {
            method: 'POST',
            headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded', 'x-apikey': process.env.VIRUSTOTAL_API_KEY },
            body: new URLSearchParams({ url })
        };

        const res = await fetch('https://www.virustotal.com/api/v3/urls', options);
        const data = await res.json();

        const analysis = await this._getVirusTotalAnalysis(data.data.id);

        return analysis;
    }

    /**
     * Get File/URL Analysis Report from VirusTotal
     * @param {string} analysis_id Analysis ID returned by VirusTotal
     * @returns {Promise} Result object
     */
    async _getVirusTotalAnalysis(analysis_id) {
        return new Promise(async (resolve, reject) => {
            const options = {
                method: 'GET',
                headers: { accept: 'application/json', 'content-type': 'multipart/form-data', 'x-apikey': process.env.VIRUS_TOTAL_API_KEY }
            };

            const res = await fetch('https://www.virustotal.com/api/v3/analyses/' + analysis_id, options);
            const data = (await res.json()).data.attributes;

            if (data.status == 'queued') {
                return resolve(this._getVirusTotalAnalysis(analysis_id));
            } else return resolve(data);
        });
    }

    scanFileThroughCloudmersive = async () => {
        const formData = new FormData();
        formData.append('inputFile', await this._blobToBuffer(this.fileblob), { filename: this.filename, type: this.filetype.mime });

        const options = {
            method: 'POST',
            headers: { accept: 'application/json', 'content-type': 'multipart/form-data', 'Apikey': process.env.CLOUDMERSIVE_API_KEY },
            body: formData
        };

        const res = await fetch('https://api.cloudmersive.com/virus/scan/file', options);
        const result = await res.json();
        return result;
    }

    scanFileThroughBytescale = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.BYTESCALE_API_KEY}`,
                'Content-Type': this.filetype.mime,
            },
            body: this.fileblob
        };

        const res = await fetch(`https://api.bytescale.com/v2/accounts/${process.env.BYTESCALE_ACCOUNT_ID}/uploads/binary`, options)
        const result = await res.json();

        const analysis = await this._getBytescaleAnalysis(result.fileUrl);

        return analysis;
    }

    /**
     * Get File Analysis Report from Bytescale
     * @param {string} fileurl fileurl from Bytescale
     * @returns {Promise} Result object
     */
    _getBytescaleAnalysis = async (fileurl) => {
        return new Promise(async (resolve, reject) => {
            const url = fileurl.replace("raw", "antivirus");

            const res = await fetch(url, { method: 'GET' });
            const data = await res.json();

            if (data.status == 'Pending') {
                return resolve(await this._getBytescaleAnalysis(url));
            } else return resolve(data.summary.result);
        })
    }

    /**
     * Convert Blob type to Buffer
     * @param {Blob} blob 
     * @returns {Buffer}
     */
    async _blobToBuffer(blob) {
        const arrayBuffer = await blob.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
}

module.exports = Scanner;