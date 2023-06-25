const fetch = require("node-fetch");
const uuid4 = require("uuid4");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const agent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.58";
let cookie = "";

const BASE_URL = `https://www.tutti.ch/api`;
const VERSION = `v10`;
const SOURCE = `web r1.0-2023-06-23-09-30`;
const IDENTIFIER = `web/1.0.0+env-live.git-1e9d7c4`;

const cfBypass = async () => {
  let url = "https://www.tutti.ch/it";

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setUserAgent(agent);
  await page.goto(url);
  // wait for networkidle0
  await page.waitForNavigation({ waitUntil: "networkidle0" });
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

exports.request = (
  path,
  options = {},
  return_cookies = false,
  is_stream = false
) => {
  return new Promise((resolve, reject) => {
    let defaultHeaders = {
      "x-tutti-hash": uuid4(),
      "x-tutti-source": SOURCE,
      "x-tutti-client-identifier": IDENTIFIER,
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
        if (response.status === 503 || response.status === 429) {
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
