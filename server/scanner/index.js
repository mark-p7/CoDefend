require("dotenv").config();
const fetch = require("node-fetch");
const FormData = require("form-data");

/**
 * @typedef {Object} FileVirusAnalysis
 * @param {Object} [virusTotalResult] Results from VirusTotal
 * @param {Object} [byteScaleResult] Results from Bytescale
 * @param {Object} [cloudMersiveResult] Results from CloudMersive
 * @param {Object} stats Total stats from all virus scans
 * @param {Array} viruses All found viruses
 */

/**
 * @typedef {Object} UrlVirusAnalysis
 * @param {Object} [virusTotalResult] Results from VirusTotal
 * @param {Object} stats Total stats from all virus scans
 * @param {Array} viruses All found viruses
 */

class Scanner {
    constructor(fileoptions, options) {
        this.fileblob = fileoptions?.blob || null;
        this.filetype = fileoptions?.type || null;
        this.filename = fileoptions?.filepath.split("/").pop() || null;
        this.options = {
            virusTotal: options.virusTotal || false,
            byteScale: options.byteScale || false,
            cloudMersive: options.cloudMersive || false,
        };
    }

    /**
     * Scan the file for any potential viruses
     * @returns {FileVirusAnalysis} 
     */
    scanFileforViruses = async () => {
        const result = { stats: {
          malicious: 0,
          suspicious: 0,
          undetected: 0,
          harmless: 0,
          failed: 0
        }, viruses: []};

        // VirusTotal
        if (this.options.virusTotal) {
            result["virusTotalResult"] = await this.scanFileThroughVirusTotal();
            let stat = result["virusTotalResult"].stats

            result.stats.malicious += stat.malicious;
            result.stats.suspicious += stat.suspicious;
            result.stats.undetected += stat.undetected;
            result.stats.harmless += stat.harmless;
            result.stats.failed += stat.failure + stat['type-unsupported'];
        }

        //Bytescale
        if (this.options.byteScale) {
            result["byteScaleResult"] = (await this.scanFileThroughBytescale()).files[0];

            switch (result["byteScaleResult"].result) {
              case "Healthy": result.stats.harmless++; break;
              case "Infected": result.stats.malicious++; break;
              case "Skipped": result.stats.failed++; break;
            }

            result.viruses = result.viruses.concat(result["byteScaleResult"].viruses);
        }

        //CloudMersive
        if (this.options.cloudMersive) {
            result["cloudMersiveResult"] = await this.scanFileThroughCloudmersive();
            if (result["cloudMersiveResult"].CleanResult) {
              result.stats.harmless++;
            } else {
              result.stats.malicious++;
              result.viruses = result.viruses.concat(result["cloudMersiveResult"].FoundViruses || []);
            }
        }

        return result;
    }

    /**
     * Scan the url for potential viruses
     * @param {string} url Url to scan
     * @returns {UrlVirusAnalysis}
     */
    scanUrlForViruses = async (url) => {
      const result = { stats: {
        malicious: 0,
        suspicious: 0,
        undetected: 0,
        harmless: 0,
        failed: 0
      }};

      if (this.options.virusTotal) {
        result["virusTotalResult"] = await this.scanUrlThroughVirusTotal(url);
        let stat = result["virusTotalResult"].stats

        result.stats.malicious += stat.malicious;
        result.stats.suspicious += stat.suspicious;
        result.stats.undetected += stat.undetected;
        result.stats.harmless += stat.harmless;
        result.stats.failed += stat.timeout;
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

    /**
     * Scan the file using VirusTotal
     * @returns {Object} Object of results
     */
    scanFileThroughVirusTotal = async () => {
        const formData = new FormData();
        formData.append('file', await this._blobToBuffer(this.fileblob), { filename: this.filename, type: this.filetype.mime });

        const options = {
            method: 'POST',
            headers: { accept: 'application/json', 'x-apikey': process.env.VIRUSTOTAL_API_KEY },
            body: formData
        };

        const res = await fetch('https://www.virustotal.com/api/v3/files', options);

        const analysis_id = (await res.json()).data.id;
        const analysis = await this._getVirusTotalAnalysis(analysis_id);

        return analysis;
    }

    /**
     * Scan the url using VirusTotal
     * @param {string} url Url to scan
     * @returns {Object} Object of results
     */
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
                headers: { accept: 'application/json', 'content-type': 'multipart/form-data', 'x-apikey': process.env.VIRUSTOTAL_API_KEY }
            };

            const res = await fetch('https://www.virustotal.com/api/v3/analyses/' + analysis_id, options);
            const data = (await res.json()).data.attributes;

            if (data.status == 'queued') {
                await this.sleep(1000);
                return resolve(this._getVirusTotalAnalysis(analysis_id));
            } else return resolve(data);
        });
    }

    /**
     * Scan the file using CloudMersive
     * @returns {Object} Object of results
     */
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

    /**
     * Scan the file using Bytescale
     * @returns {Object} Object of results
     */
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
        if (result.error) {
          return {
            files: [
              {
                viruses: [],
                result: "Skipped"
              }
            ]
          }
        }
        
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
                await this.sleep(1000);
                return resolve(await this._getBytescaleAnalysis(fileurl));
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

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = Scanner;