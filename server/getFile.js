const { createWriteStream, existsSync, mkdirSync, unlinkSync } = require("fs");
const fetch = require("node-fetch");
const path = require("path");

const CACHE_PATH = path.join(__dirname, "cache");

/**
 * @typedef {Object} FileResponse
 * @param {int} status Return 1 if successfully, 0 if errored
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

        resolve({status: 1, body: response.body, filepath}); 
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
}