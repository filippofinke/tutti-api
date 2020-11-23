const config = require(__dirname + "/config");
const fetch = require("node-fetch");
const uuid4 = require("uuid4");

exports.request = (path, options = { method: "GET" }) => {
  return new Promise((resolve, reject) => {
    fetch(`${config.env.BASE_URL}/${config.env.VERSION}/${path}`, {
      headers: {
        "x-tutti-hash": uuid4(),
      },
      ...options,
    }).then((response) => {
      resolve(response.json());
    });
  });
};
