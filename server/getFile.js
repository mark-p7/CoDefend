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

      //! This breaks if the filename is not in the link, only supports https
      const filename = url.split("/").pop(); //Gets the filename from the end of the url
      const response = await fetch(url);
  
      if (response.ok && response.body) {
        const filepath = path.join(CACHE_PATH, filename);
        console.log("Writing to file:", filename);
        let file = createWriteStream(filepath);
        response.body.pipe(file);

        resolve({status: 1, blob: await response.blob(), filepath}); 
      } else reject({status: 0, body: "Error downloading"});
    });
  }

  /**
   * Delete a file from cache
   * @param {string} filepath Full filepath
   */
  clearFile(filepath) {
    unlinkSync(filepath);
  }

  /**
   * 
   * @param {string} filepath 
   */
  getDataURL(filepath) {
    return new Promise(async (resolve, reject) => {
      const encoding = "base64";
      const bitmap = fs.readFileSync(filepath);
      const bits =  new Buffer(bitmap).toString('base64');
  
      detectFileType.fromFile(filepath, (err, filetype) => {
        return resolve('data:' + filetype.mime + ';' + encoding + ',' + bits);
      });
    })
  }
}

module.exports = FileHandler;