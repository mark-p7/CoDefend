const { createWriteStream, existsSync, mkdirSync, unlinkSync, readFileSync } = require("fs");
const fetch = require("node-fetch");
const path = require("path");
const detectFileType = require("detect-file-type");

const CACHE_PATH = path.join(__dirname, "cache");

/**
 * @typedef {Object} FileResponse
 * @param {int} status Return 1 if successful, 0 if errored
 * @param {Object} body Response body
 * @param {string} path Absolute filepath of the saved file
 */

class FileHandler {

  constructor() {
    if (!existsSync(CACHE_PATH)) mkdirSync(CACHE_PATH);
  }

  /**
   * Download the file from the url
   * @param {string} url The url to download from
   * @returns {FileResponse} 
   */
  downloadFile(url) {
    return new Promise(async (resolve, reject) => {
      if (!url) return reject({status: 0, body: "No URL provided"});

      //Remove search parameters from link
      const urlObj = new URL(url);
      urlObj.search = '';
      const urlstring = urlObj.toString();

      //Gets the filename from the end of the url
      const filename = urlstring.split("/").pop(); 
      const response = await fetch(this.safeFetchURL(urlstring)); // Only supports https
      if (response.ok && response.body) {
        const filepath = path.join(CACHE_PATH, filename);
        let file = createWriteStream(filepath);
        response.body.pipe(file);
        resolve({status: 1, blob: await response.blob(), filepath, type: await this.getFileType(filepath)}); 
      } else reject({status: 0, body: "Error downloading"});
    });
  }
  
  /**
   * Force url to be https if available
   * @param {string} url 
   * @returns 
   */
  safeFetchURL = (url) => {
    const secureUrl = url.replace(/^http:/, 'https:');
    return secureUrl;
  }

  /**
   * Delete a file from cache
   * @param {string} filepath Full filepath
   */
  clearFile(filepath) {
    unlinkSync(filepath);
  }

  /**
   * Get the file data as a dataURL
   * @param {string} filepath 
   * @returns {Promise} dataURL
   */
  getDataURL(filepath) {
    return new Promise(async (resolve, reject) => {
      const encoding = "base64";
      const bitmap = readFileSync(filepath);
      const bits =  new Buffer(bitmap).toString('base64');
  
      detectFileType.fromFile(filepath, (err, filetype) => {
        return resolve('data:' + filetype.mime + ';' + encoding + ',' + bits);
      });
    })
  }

  /**
   * Get the file type
   * @param {string} filepath 
   * @returns {Promise} {type, mime}
   */
  getFileType(filepath) {
    return new Promise(async (resolve, reject) => {
      detectFileType.fromFile(filepath, (err, filetype) => {
        return resolve(filetype);
      });
    });
  }
}

module.exports = FileHandler;