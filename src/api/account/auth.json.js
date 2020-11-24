const utils = require(__dirname + "/../../utils");

exports.account = {};
exports.account.login = (email, password, remember = true) => {
  const params = new URLSearchParams();
  params.append("email", email);
  params.append("password", password);
  params.append("remember", remember);

  return utils.request("account/auth.json", {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: params,
    method: "POST",
  });
};
