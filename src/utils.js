const fetch = require("node-fetch");
const uuid4 = require("uuid4");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const agent =
  "Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36 Edg/126.0.0.0";
let cookie = "";

const BASE_URL = `https://www.tutti.ch/api`;
const VERSION = `v10`;
const SOURCE = `web r1.0-2024-07-12-12-17`;
const IDENTIFIER = `web/1.0.0+env-live.git-8e2baf71`;

const cfBypass = async () => {
  let url = "https://www.tutti.ch/";

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setUserAgent(agent);
  await page.goto(url);
  // wait for networkidle0
  try {
    await page.waitForNavigation({ waitUntil: "networkidle0" });
  } catch (e) {
    console.log("Error waiting for navigation");
  }
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
