const tutti_api = require("./../src/index");

(async () => {
  console.log(await tutti_api.account.getPublicProfile("709351413517428665"));

  console.log(await tutti_api.account.login(process.env.EMAIL, process.env.PASSWORD, true));
  let pr = (await tutti_api.search.page(1).find("xbox | ps4")).items;
  pr.forEach((p) => console.log(p.subject));

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

  const messageHandler = ({ convId, messages }) => {
    for (let messageId in messages) {
      let {
        id,
        content: { text },
        type,
        senderPublicAccountId,
        offset,
        timestamp,
      } = messages[messageId];
      console.log(id, text, type, senderPublicAccountId, offset, timestamp);
    }
  };

  const conversationHandler = (conversations) => {
    for (let convId in conversations) {
      let {
        id,
        item: { id: itemId, subject },
        latestMessage: {
          content: { text },
          type,
          timestamp,
          senderPublicAccountId,
        },
      } = conversations[convId];
      console.log(id, itemId, subject, "\n", text, type, timestamp, senderPublicAccountId, "\n");
      tutti_api.messaging.setMessageHandler(id, messageHandler);
    }
  };

  tutti_api.messaging.setConversationHandler(conversationHandler);

  const statusHandler = ({ conversationsWithUnreadMessages }) => {
    console.log(`conversationsWithUnreadMessages: ${conversationsWithUnreadMessages}`);
  };

  tutti_api.messaging.setStatusHandler(statusHandler);
})();
