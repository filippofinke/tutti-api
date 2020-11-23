const utils = require(__dirname + "/../../utils");

exports.getSubCategories = () => {
  return utils.request("config/subcategories");
};
