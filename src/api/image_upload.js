const utils = require(__dirname + "/../utils");
const FormData = require("form-data");
const fs = require("fs");

exports.uploadImage = (path) => {
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
