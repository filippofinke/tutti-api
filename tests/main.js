const config = require("./../src/config");
const tutti_api = require("./../src/index");

(async () => {
  console.log(await tutti_api.account.login(config.env.EMAIL, config.env.PASSWORD, true));

  /*let subcategories = await tutti_api.config.getSubCategories();
  console.log(subcategories);

  let json = await tutti_api.search
    .type(tutti_api.type.offer)
    .canton(tutti_api.canton.ticino)
    .find();
  console.log(json);*/
})();
