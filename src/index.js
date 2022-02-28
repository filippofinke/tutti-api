require("dotenv").config();

if (process.env.DEBUG === "true") {
  console.log("🤖 tutti-api is in DEBUG mode!");
}

const account = require("./api/account");
const config = require("./api/config");
const messaging = require("./api/messaging");
const subscriptions = require("./api/subscriptions");
const search = require("./api/search");
const uploadImage = require("./api/image_upload");

module.exports = {
  account,
  config,
  messaging,
  subscriptions,
  ...search,
  uploadImage,
};
