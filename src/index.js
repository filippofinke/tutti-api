const { dir } = require("console");
const fs = require("fs");

const scan = (directory) => {
  fs.readdirSync(directory).forEach((file) => {
    let path = directory + "/" + file;
    let stats = fs.statSync(path);
    if (stats.isDirectory()) {
      scan(path);
    } else if (stats.isFile() && path.endsWith(".js")) {
      module.exports = {
        ...module.exports,
        ...require(path),
      };
    }
  });
};

scan(__dirname + "/api");
