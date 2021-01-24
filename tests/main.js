const tutti_api = require("./../src/index");

(async () => {

  let pr = (await tutti_api.search.find("xbox | ps4")).items;
  pr.forEach((p) => console.log(p.subject));

  console.log(
    await tutti_api.account.login(process.env.EMAIL, process.env.PASSWORD, true)
  );
  console.log(await tutti_api.subscriptions.getAvailableBumps());
  console.log(await tutti_api.account.getPaywall());
  console.log(await tutti_api.subscriptions.getPlans());
  console.log(await tutti_api.account.getSubscription());
  console.log(await tutti_api.account.getFavorites());
  console.log(await tutti_api.account.getProfile());
  console.log(await tutti_api.account.getItems());
  console.log(await tutti_api.account.getPendingItems());
  console.log(await tutti_api.account.getItemsToModify());
  console.log(await tutti_api.account.getDisabledItems());
  console.log(await tutti_api.account.getArchivedItems());
  console.log(await tutti_api.uploadImage(__dirname + "/test.jpg"));
  console.log(await tutti_api.account.logout());
})();
