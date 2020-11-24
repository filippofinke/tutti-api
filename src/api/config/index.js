const utils = require(__dirname + "/../../utils");

exports.config = {
  getSubCategories() {
    return utils.request("config/subcategories");
  },
};
