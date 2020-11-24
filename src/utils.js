const config = require(__dirname + "/config");
const fetch = require("node-fetch");
const uuid4 = require("uuid4");

exports.request = (path, options = {}) => {
  return new Promise((resolve, reject) => {
    let defaultHeaders = {
      "x-tutti-hash": uuid4(),
    };

    options.headers = {
      ...options.headers,
      ...defaultHeaders,
    };

    fetch(`${config.env.BASE_URL}/${config.env.VERSION}/${path}`, options).then(
      (response) => {
        resolve(response.json());
      }
    );
  });
};
