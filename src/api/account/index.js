const utils = require(__dirname + "/../../utils");

/** @module account */
module.exports = {
  _user: null,

  /**
   * Login to an existing account.
   * @method login
   * @param {string} email - The email.
   * @param {string} password - The password.
   * @param {boolean} remember - If the session must be saved.
   * @return {Promise} The status of the login.
   */
  login(email, password, remember = true) {
    const params = new URLSearchParams();
    params.append("email", email);
    params.append("password", password);
    params.append("remember", remember);
    params.append("seonSession", "undefined");

    let request = utils.request(
      "account/auth.json",
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        body: params,
        method: "POST",
      },
      true
    );
    request.then((json) => {
      this._user = json;
    });
    return request;
  },

  /**
   * Register a new account.
   * @method register
   * @param {string} email - The email.
   * @param {string} password - The password.
   * @return {Promise} The status of the registration.
   */
  register(email, password) {
    const params = new URLSearchParams();
    params.append("email", email);
    params.append("password", password);
    params.append("password_confirm", password);
    return utils.request("account.json", { method: "POST", body: params });
  },

  /**
   * Logout from the current account.
   * @method logout
   */
  logout() {
    this._user = null;
  },

  /**
   * Delete the current account.
   * @method delete
   * @param {string} password - The password.
   * @return {Promise} The status of the deletion.
   */
  delete(password) {
    if (this._user != null) {
      const params = new URLSearchParams();
      params.append("password", password);
      params.append("delete_items", true);

      let request = utils.request("account/delete.json", {
        headers: {
          cookie: this._user.cookies,
        },
        body: params,
        method: "POST",
      });
      request.then(() => this.logout);
      return request;
    }
  },

  /**
   * Get the current pay wall.
   * @method getPaywall
   * @return {Promise} The pay wall.
   */
  getPaywall() {
    if (this._user != null) {
      return utils.request("account/myPaywall", {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },

  /**
   * Get the current subscriptions.
   * @method getSubscription
   * @return {Promise} The subscriptions.
   */
  getSubscription() {
    if (this._user != null) {
      return utils.request("subscriptions/mySubscription", {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },

  /**
   * Get the favorites.
   * @method getFavorites
   * @return {Promise} The favorites.
   */
  getFavorites() {
    if (this._user != null) {
      return utils.request("favorites/", {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },

  /**
   * Get the current profile.
   * @method getProfile
   * @return {Promise} The current profile.
   */
  getProfile() {
    if (this._user != null) {
      return utils.request("account/profile.json", {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },

  getPublicProfile(userId) {
    return utils.request("account/public_profile.json?id=" + userId, {
      method: "GET",
    });
  },

  /**
   * Get the user posts.
   * @method getItems
   * @param {number} [page=1] - The page.
   * @return {Promise} The posts.
   */
  getItems(page = 1) {
    if (this._user != null) {
      return utils.request(`account/myitems.json?o=${page}`, {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },

  /**
   * Get the user pending verification posts.
   * @method getPendingItems
   * @param {number} [page=1] - The page.
   * @return {Promise} The posts.
   */
  getPendingItems(page = 1) {
    if (this._user != null) {
      return utils.request(`account/myitems/pending.json?o=${page}`, {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },
  /**
   * Get the user posts pending modification.
   * @method getItemsToModify
   * @param {number} [page=1] - The page.
   * @return {Promise} The posts.
   */
  getItemsToModify(page = 1) {
    if (this._user != null) {
      return utils.request(`account/myitems/action.json?o=${page}`, {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },
  /**
   * Get the user disabled posts.
   * @method getDisabledItems
   * @param {number} [page=1] - The page.
   * @return {Promise} The posts.
   */
  getDisabledItems(page = 1) {
    if (this._user != null) {
      return utils.request(`account/myitems/hidden.json?o=${page}`, {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },
  /**
   * Get the user archived posts.
   * @method getArchivedItems
   * @param {number} [page=1] - The page.
   * @return {Promise} The posts.
   */
  getArchivedItems(page = 1) {
    if (this._user != null) {
      return utils.request(`account/myitems/noaction.json?o=${page}`, {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },
};
