const utils = require(__dirname + "/../../utils");

exports.account = {
  _user: null,

  login(email, password, remember = true) {
    const params = new URLSearchParams();
    params.append("email", email);
    params.append("password", password);
    params.append("remember", remember);

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

  getPaywall() {
    if (this._user != null) {
      return utils.request("account/myPaywall", {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },

  getSubscription() {
    if (this._user != null) {
      return utils.request("subscriptions/mySubscription", {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },

  getFavorites() {
    if (this._user != null) {
      return utils.request("favorites/", {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },

  getProfile() {
    if (this._user != null) {
      return utils.request("account/profile.json", {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },

  getItems(page = 1) {
    if (this._user != null) {
      return utils.request(`account/myitems.json?o=${page}`, {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },
  getPendingItems(page = 1) {
    if (this._user != null) {
      return utils.request(`account/myitems/pending.json?o=${page}`, {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },
  getItemsToModify(page = 1) {
    if (this._user != null) {
      return utils.request(`account/myitems/action.json?o=${page}`, {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },
  getDisabledItems(page = 1) {
    if (this._user != null) {
      return utils.request(`account/myitems/hidden.json?o=${page}`, {
        headers: {
          cookie: this._user.cookies,
        },
      });
    }
  },
};
