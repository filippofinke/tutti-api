const fetch = require("node-fetch");
const uuid4 = require("uuid4");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const agent =
  "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Mobile Safari/537.36 Edg/88.0.705.50";
let cookie = "";

const BASE_URL = `https://www.tutti.ch/api`;
const VERSION = `v10`;

const cfBypass = async () => {
  let url = "https://www.tutti.ch/it";

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(agent);
  await page.goto(url);
  await page.waitForTimeout(25000);
  const cookies = await page.cookies();
  await browser.close();

  return (
    cookies
      .map((c) => {
        return `${c.name}=${c.value}`;
      })
      .join("; ") + ";"
  );
};

exports.request = (path, options = {}, return_cookies = false, is_stream = false) => {
  return new Promise((resolve, reject) => {
    let defaultHeaders = {
      "x-tutti-hash": uuid4(),
      "x-tutti-source": "web latest-staging",
      "user-agent": agent,
    };

    options.headers = {
      ...options.headers,
      ...defaultHeaders,
    };

    if (options.headers["cookie"]) {
      options.headers["cookie"] += " " + cookie;
    } else {
      options.headers["cookie"] = cookie;
    }

    let url = `${BASE_URL}/${VERSION}/${path}`;

    if (process.env.DEBUG === "true") {
      console.log(url);
    }

    fetch(url, options)
      .then(async (response) => {
        if (response.status === 503) {
          console.log("Please wait, bypassing CloudFlare WAF");
          cookie = await cfBypass();
          return resolve(this.request(path, options, return_cookies));
        }

        if (is_stream) {
          let body = await response.body;
          return resolve(body);
        } else {
          let text = await response.text();

          try {
            let json = JSON.parse(text);
            if (return_cookies) {
              json.cookies = response.headers.get("set-cookie");
            }
            return resolve(json);
          } catch (e) {
            console.log("PARSE ERROR");
            console.log(text);
            return reject("Invalid json response");
          }
        }
      })
      .catch((error) => console.log("fetch-error", error));
  });
};
