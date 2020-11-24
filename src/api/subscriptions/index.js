const utils = require(__dirname + "/../../utils");
const account = require(__dirname + "/../account/index").account;

exports.subscriptions = {
  getAvailableBumps() {
    if (account._user != null) {
      return utils.request("subscriptions/myAvailableBumps", {
        headers: {
          cookie: account._user.cookies,
        },
      });
    }
  },
};
