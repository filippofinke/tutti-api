const tutti_api = require("./../src/index");

(async () => {
  console.log(await tutti_api.account.getPublicProfile("709351413517428665"));
  console.log(
    await tutti_api.account.login(process.env.EMAIL, process.env.PASSWORD, true)
  );

  let pr = (await tutti_api.search.find("xbox | ps4")).edges;
  pr.forEach((p) => console.log(p.node.title, p.node.formattedPrice));

  console.log(await tutti_api.subscriptions.getAvailableBumps());
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(await tutti_api.account.getPaywall());
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(await tutti_api.subscriptions.getPlans());
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(await tutti_api.account.getSubscription());
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(await tutti_api.account.getFavorites());
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(await tutti_api.account.getProfile());
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(await tutti_api.account.getItems());
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(await tutti_api.account.getPendingItems());
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(await tutti_api.account.getItemsToModify());
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(await tutti_api.account.getDisabledItems());
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(await tutti_api.account.getArchivedItems());
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(await tutti_api.uploadImage(__dirname + "/test.jpg"));
  await new Promise((resolve) => setTimeout(resolve, 1000));

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
      console.log(
        id,
        itemId,
        subject,
        "\n",
        text,
        type,
        timestamp,
        senderPublicAccountId,
        "\n"
      );
      tutti_api.messaging.setMessageHandler(id, messageHandler);
    }
  };

  tutti_api.messaging.setConversationHandler(conversationHandler);

  const statusHandler = ({ conversationsWithUnreadMessages }) => {
    console.log(
      `conversationsWithUnreadMessages: ${conversationsWithUnreadMessages}`
    );
  };

  tutti_api.messaging.setStatusHandler(statusHandler);
})();
