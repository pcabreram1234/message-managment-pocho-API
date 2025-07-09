const express = require("express");
const { FailedMessageService } = require("../services/failed_message.service");
const { verifyToken } = require("../middlewares/auth.handler");
const router = express.Router();
const service = new FailedMessageService();
const fs = require("fs");
const path = require("path");
require("dotenv").config();

router.get("/", verifyToken, async (req, resp, next) => {
  try {
    const { id } = req.user;
    const faileMessages = await service.findFailedMessages(id);
    resp.json(faileMessages);
  } catch (error) {
    next(error);
  }
});

router.get("/getShippmentHistory", verifyToken, async (req, resp, next) => {
  try {
    const { id } = req.user;
    const faileMessages = await service.getShippmentHistory(id);
    resp.json(faileMessages);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/getFailedMessagePreview/:id",
  verifyToken,
  async (req, resp, next) => {
    try {
      const messageId = req.params.id;

      const failedMessage = await service.getFailedMessage(messageId);

      const templatePath = path.join(
        __dirname,
        "..",
        "/templates/",
        "mail_template.html"
      );

      let emailTemplate = fs.readFileSync(templatePath, "utf8");

      emailTemplate = emailTemplate.replace(
        "{{MENSAJE_PROGRAMADO}}",
        failedMessage.message_content
      );
      resp.send(emailTemplate);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/getFailedMessagesToDownload/:failedMessageId",
  verifyToken,
  async (req, resp, next) => {
    try {
      const { id } = req.user;
      const { failedMessageId } = req.params;
      const messageToDownload = await service.getFailedMessagesToDownload(
        failedMessageId,
        id
      );
      resp.json(messageToDownload);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/stopMessageSent/:failedMessageId/:messageConfigId",
  verifyToken,
  async (req, resp, next) => {
    try {
      const { id } = req.user;
      const { failedMessageId, messageConfigId } = req.params;
      const messageToStopSent = await service.stopMessageSent({
        failedMessageId: failedMessageId,
        messageConfigId: messageConfigId,
        userId: id,
      });

      resp.json(messageToStopSent);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
