const ndjson = require("ndjson");
const uuid4 = require("uuid4");
const utils = require(__dirname + "/../../utils");
const account = require(__dirname + "/../account/index");

/** @module account */
module.exports = {
  initChat(itemId, text, email, name) {
    if (account._user != null) {
      const params = new URLSearchParams();
      params.append("body", text);
      params.append("email", email);
      params.append("item_id", itemId);
      params.append("name", name);

      return utils.request(`item/reply.json`, {
        method: "POST",
        headers: {
          cookie: account._user.cookies,
        },
        body: params,
      });
    }
  },

  sendMessage(conversationId, message) {
    if (account._user != null) {
      return utils.request(`messaging/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          cookie: account._user.cookies,
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          id: uuid4(),
          payload: message,
          type: "text",
        }),
      });
    }
  },

  async setMessageHandler(conversationId, handler) {
    if (account._user != null) {
      const stream = await utils.request(
        "messaging/stream/conversations/" + conversationId + "/messages",
        {
          headers: {
            cookie: account._user.cookies,
          },
        },
        false,
        true
      );

      stream.pipe(ndjson.parse()).on("data", (data) => {
        handler(data.data);
      });
    }
  },

  async setConversationHandler(handler) {
    if (account._user != null) {
      const stream = await utils.request(
        "messaging/stream/conversations",
        {
          headers: {
            cookie: account._user.cookies,
          },
        },
        false,
        true
      );

      stream.pipe(ndjson.parse()).on("data", (data) => {
        handler(data.data);
      });
    }
  },
  async setStatusHandler(handler) {
    if (account._user != null) {
      const stream = await utils.request(
        "messaging/stream/status",
        {
          headers: {
            cookie: account._user.cookies,
          },
        },
        false,
        true
      );

      stream.pipe(ndjson.parse()).on("data", (data) => {
        handler(data.data);
      });
    }
  },
};
