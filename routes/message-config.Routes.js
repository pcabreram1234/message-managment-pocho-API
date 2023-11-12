const express = require("express");
const { MessageConfigService } = require("../services/message-config.service");
const { validatorHandler } = require("../middlewares/validator.handler");
const {
  create_message_configuration_schema,
} = require("../schemas/Message-config.Schemas");
const router = express.Router();
const service = new MessageConfigService();
const { handleLogs } = require("../utils/handleLogs");
const { file } = require("../utils/globals");
const { getCurrentDate } = require("../utils/funtions");
const { verifyToken } = require("../middlewares/auth.handler");
require("dotenv").config();

router.get("/", verifyToken, async (req, resp, next) => {
  try {
    const configuration = await service.find();
    resp.json({ result: configuration });
  } catch (error) {
    next(error);
  }
});

router.get("/getCurrentDate", verifyToken, async (req, resp, next) => {
  try {
    const actualDate = getCurrentDate();
    resp.json(actualDate);
    resp.send();
    handleLogs(
      file,
      `${actualDate} sended as a date to verify the current date vs the date inputed by the user`
    );
  } catch (error) {
    next(error);
  }
});

router.post(
  "/addMesageConfiguration",
  verifyToken,
  validatorHandler(create_message_configuration_schema, "body"),
  async (req, resp, next) => {
    try {
      const data = req.body.data;
      const newMessage = await service.addMessage(data);
      handleLogs(
        file,
        `Message ${data.message} to be sended to ${data.send_to} on ${data.send_on_date} was sucessful configurated`
      );
      resp.jsonp({ result: newMessage });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/addMesagesConfiguration/",
  verifyToken,
  validatorHandler(create_message_configuration_schema, "body"),
  async (req, resp, next) => {
    try {
      const { data } = req.body;
      // Como el objeto data esta en formato string primero lo parseamos a JSON
      // Luego ese JSON lo parseamos a objeto para poder iterar sobre el
      const messages = JSON.parse(JSON.stringify(data));
      const newMessage = await service.addMEssages(messages);
      handleLogs(
        file,
        `Message ${data.message} to be sended to ${data.send_to} on ${data.send_on_date} was sucessful configurated`
      );
      resp.jsonp({ result: newMessage });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/verifyMessage/",
  verifyToken,
  validatorHandler(create_message_configuration_schema, "body"),
  async (req, resp, next) => {
    try {
      const { data } = req.body;
      const messageToVerify = await service.findExistentMessage(data);
      resp.json({
        result: messageToVerify,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/verifyMessages/",
  verifyToken,
  validatorHandler(create_message_configuration_schema, "body"),
  async (req, resp, next) => {
    try {
      const { data } = req.body;
      const messageToVerify = await service.findExistentMessages(data);
      resp.json({
        result: messageToVerify,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
