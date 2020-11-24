const utils = require(__dirname + "/../../utils");

exports.account = {
  _user: null,

  login(email, password, remember = true) {
    const params = new URLSearchParams();
    params.append("email", email);
    params.append("password", password);
    params.append("remember", remember);

    let request = utils.request("account/auth.json", {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: params,
      method: "POST",
    }, true);
    request.then((json) => {
      this._user = json;
    });
    return request;
  },
};
