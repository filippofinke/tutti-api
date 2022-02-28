const utils = require(__dirname + "/../utils");
const FormData = require("form-data");
const fs = require("fs");

/** @module image_upload */

/**
 * Upload an image.
 * @method uploadImage
 * @param {string} path - The image path.
 * @return {Promise} The status of the upload.
 */
module.exports = (path) => {
  const form = new FormData();

  const stats = fs.statSync(path);
  const fileSizeInBytes = stats.size;
  const stream = fs.createReadStream(path);
  form.append("file", stream, { knownLength: fileSizeInBytes });

  return new Promise(async (resolve, reject) => {
    let result = await utils.request("image_upload.json", {
      headers: form.getHeaders(),
      method: "POST",
      body: form,
    });
    result.file = "https://c.tutti.ch/images/" + result.file;
    resolve(result);
  });
};
