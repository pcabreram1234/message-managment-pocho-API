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
    const { id } = req.user;
    const configuration = await service.find(id);
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
      const UserId = req.user.id;
      const newMessage = await service.addMessage({ ...data, UserId: UserId });
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
  "/addMesagesConfiguration",
  verifyToken,
  validatorHandler(create_message_configuration_schema, "body"),
  async (req, resp, next) => {
    try {
      const { data } = req.body;
      // Como el objeto data esta en formato string primero lo parseamos a JSON
      // Luego ese JSON lo parseamos a objeto para poder iterar sobre el
      const messages = JSON.parse(JSON.stringify(data));
      const UserId = req.user.id;
      const newMessage = await service.addMEssages({
        messages,
        UserId: UserId,
      });
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
  "/verifyMessage",
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

router.get("/getUserStatistics", verifyToken, async (req, resp, next) => {
  try {
    const { id } = req.user;
    const userStatistics = await service.getUserStatistics(id);
    resp.json(userStatistics);
  } catch (error) {
    next(error);
  }
});

router.get("/findSendedMessages", verifyToken, async (req, resp, next) => {
  try {
    const { id } = req.user;
    const sendedMessages = await service.findSendedMessages(id);
    resp.json(sendedMessages);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/findMessagesSendedPerWeek",
  verifyToken,
  async (req, resp, next) => {
    try {
      const { id } = req.user;
      const sendedMessages = await service.findMessagesSendedPerWeek(id);
      resp.json(sendedMessages);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/findMessagesAboutToSent", verifyToken, async (req, resp, next) => {
  try {
    console.log("hola");
    const { id } = req.user;
    const sendedMessages = await service.findMessagesAboutToSent(id);
    resp.json(sendedMessages);
  } catch (error) {
    next(error);
  }
});

router.post("/scheduleMessages", verifyToken, async (req, resp, next) => {
  try {
    const userId = req.user?.id;
    const { data } = req.body;
    const scheduledMessages = await service.scheduleMessages({
      userId: userId,
      ...data,
    });
    resp.json(scheduledMessages);
  } catch (error) {
    next(error);
  }
});

router.post("/scheduleCustomMessage", verifyToken, async (req, resp, next) => {
  try {
    const userId = req.user?.id;
    const { data } = req.body;
    const scheduledCustomMessage = await service.schduleCustomMessage({
      userId: userId,
      ...data,
    });
    resp.json(scheduledCustomMessage);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/sendMessage/:messageConfigId/:failedMessageId",
  verifyToken,
  async (req, resp, next) => {
    try {
      const userId = req.user?.id;
      const { messageConfigId, failedMessageId } = req.params;
      const attemptToSendMessage = await service.sendMessage({
        failedMessageId: failedMessageId,
        messageConfigId: messageConfigId.toString(),
        userId: userId,
      });

      resp.json(attemptToSendMessage);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
