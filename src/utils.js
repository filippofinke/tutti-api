const fetch = require("node-fetch");
const uuid4 = require("uuid4");

exports.request = (path, options = {}, return_cookies = false) => {
  return new Promise((resolve, reject) => {
    let defaultHeaders = {
      "x-tutti-hash": uuid4(),
    };

    options.headers = {
      ...options.headers,
      ...defaultHeaders,
    };

    let url = `${process.env.BASE_URL}/${process.env.VERSION}/${path}`;

    if (process.env.DEBUG === "true") {
      console.log(url);
      console.log(options);
    }

    fetch(url, options).then(async (response) => {
      let json = await response.json();
      if (return_cookies) {
        json.cookies = response.headers.get("set-cookie");
      }
      resolve(json);
    });
  });
};
