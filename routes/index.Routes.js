const express = require("express");
const contactsRouter = require("./contacts.Routes");
const messageRouter = require("./messages.Routes");
const categoriesRouter = require("./categories.Routes");
const message_configRouter = require("../routes/message-config.Routes");
const userRouter = require("../routes/users.Routes");
const messageContactsRouter = require("./messagesContacts.Routes");

function routerApi(app) {
  const router = express.Router();
  app.use("/api/v1", router);
  router.use("/contacts", contactsRouter);
  router.use("/messages", messageRouter);
  router.use("/categories", categoriesRouter);
  router.use("/configuration", message_configRouter);
  router.use("/users", userRouter);
  router.use("/messageContacts", messageContactsRouter);
}

module.exports = routerApi;
