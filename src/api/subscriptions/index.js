const utils = require(__dirname + "/../../utils");
const account = require(__dirname + "/../account/index").account;

/** @module subscriptions */

exports.subscriptions = {
  /**
   * Get the available bumps.
   * @method getAvailableBumps
   * @return {Promise} The available bumps.
   */
  getAvailableBumps() {
    if (account._user != null) {
      return utils.request("subscriptions/myAvailableBumps", {
        headers: {
          cookie: account._user.cookies,
        },
      });
    }
  },

  /**
   * Get the current plans.
   * @method getPlans
   * @return {Promise} The available plans.
   */
  getPlans() {
    return utils.request("subscriptions/plans/");
  },
};
