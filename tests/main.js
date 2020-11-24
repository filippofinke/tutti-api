const config = require("./../src/config");
const tutti_api = require("./../src/index");

(async () => {

  console.log(await tutti_api.account.login(config.env.EMAIL, config.env.PASSWORD, true));
  console.log(await tutti_api.subscriptions.getAvailableBumps());
  console.log(await tutti_api.account.getPaywall());

})();
