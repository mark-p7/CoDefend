require("dotenv").config();
const fetch = require("node-fetch");
const FormData = require("form-data");

class Scanner {
    constructor(fileoptions, options) {
        this.fileblob = fileoptions.blob;
        this.filetype = fileoptions.type;
        this.options = {
            virusTotal: options.virusTotal || false,
            byteScale: options.byteScale || false,
        };
    }

    scanFileforViruses = async () => {
        const result = {};

        // VirusTotal
        if (this.options.virusTotal) {
            result["virusTotalResult"] = await this.scanFileThroughVirusTotal();
        }

        this.scanFileThroughBytescale();


        return result;
    }

    scanFileThroughVirusTotal = async () => {
        return;
        // virustotal.postFiles({file: this.file})
        // .then(({ data }) => console.log(data))
        // .catch(err => console.error(err));

        const formData = new FormData();
        formData.append('file', this.file);

        const options = {
            method: 'POST',
            headers: { accept: 'application/json', 'content-type': 'multipart/form-data', 'x-apikey': process.env.VIRUSTOTAL_API_KEY },
            body: formData
        };

        const res = await fetch('https://www.virustotal.com/api/v3/files', options);
        console.log(res);
        console.log(await res.json());
        const analysis_id = res.json().data.id;
        const analysis = await this._getVirusTotalAnalysis(analysis_id);

        console.log(res.json)

        return res.json();
    }

    scanUrlThroughVirusTotal = async (url) => {
      if (!url) return "No URL Provided";
      const options = {
          method: 'POST',
          headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded', 'x-apikey': process.env.VIRUSTOTAL_API_KEY },
          body: new URLSearchParams({url})
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
          return resolve(this._getVirusTotalAnalysis(analysis_id));
        } else return resolve(data);
      });
    }

    scanFileThroughCloudmersive = async () => {
      console.log("called")
      const formData = new FormData();
      formData.append('inputFile', this.file);

      const options = {
          method: 'POST',
          headers: { accept: 'application/json', 'content-type': 'multipart/form-data', 'Apikey': process.env.CLOUDMERSIVE_API_KEY },
      };

      const res = await fetch('https://api.cloudmersive.com/virus/scan/file', options)
      const result = await res.json();
      console.log(result)
      return result;
    }

    scanFileThroughBytescale = async () => {
      console.log("called")
      console.log(this.filetype);

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
}

module.exports = Scanner;