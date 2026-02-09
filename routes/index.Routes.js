const express = require("express");
const contactsRouter = require("./contacts.Routes");
const messageRouter = require("./messages.Routes");
const categoriesRouter = require("./categories.Routes");
const message_configRouter = require("../routes/message-config.Routes");
const userRouter = require("../routes/users.Routes");
const messageContactsRouter = require("./messagesContacts.Routes");
const campaingRouter = require("./campaigns.Routes");
const failedMessagesRouter = require("./failed-messages.Routes");
const sendMessagesRouter = require("./sendMessages.Routes");

function routerApi(app) {
  const router = express.Router();
  app.use("/api/v1", router);
  router.use("/contacts", contactsRouter);
  router.use("/messages", messageRouter);
  router.use("/categories", categoriesRouter);
  router.use("/configuration", message_configRouter);
  router.use("/users", userRouter);
  router.use("/messageContacts", messageContactsRouter);
  router.use("/campaigns", campaingRouter);
  router.use("/failedMessages", failedMessagesRouter);
  router.use("/sendMessages",sendMessagesRouter)
}

module.exports = routerApi;
