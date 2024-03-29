const utils = require(__dirname + "/../../utils");
/** @module config */
module.exports = {
  /**
   * Get the available categories.
   * @method getSubCategories
   * @return {Promise} The available categories.
   */
  getSubCategories() {
    return utils.request("config/subcategories");
  },
};
