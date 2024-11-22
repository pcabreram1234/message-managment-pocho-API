const express = require("express");
const { MessageService } = require("../services/message.service");
const { validatorHandler } = require("../middlewares/validator.handler");
const {
  creteMessageSchema,
  updateMessageSchema,
  getMessageSchema,
} = require("../schemas/message.Schemas");
const { getCategorySchema } = require("../schemas/Category.Schemas");
const { handleLogs } = require("../utils/handleLogs");
const { file } = require("../utils/globals");
const { verifyToken } = require("../middlewares/auth.handler");
const router = express.Router();
const service = new MessageService();
require("dotenv").config();

router.get("/", verifyToken, async (req, resp, next) => {
  try {
    const messages = await service.find(req.user.id);
    /* Añadiendo al log el resultado de la operación exitosa */
    handleLogs(file, `Fetching ${messages.length} messages`);
    resp.setHeader("token", req.token);
    resp.json({ result: messages });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/addMessage",
  verifyToken,
  validatorHandler(creteMessageSchema, "body"),
  async (req, resp, next) => {
    try {
      const { data } = req.body;
      const { id } = req.user;
      const newMesage = await service.addMessage({
        ...data,
        userId: id,
      });
      /* Como el resultado de newMessage no es un JSON se debe usar el metodo send 
      del objecto response para enviarlo, ahora bien al enviarlo se envia en formato objeto */
      /* Añadiendo al log el resultado de la operación exitosa */
      handleLogs(file, `Adding ${data.message} as a new message record`);
      resp.setHeader("token", req.token);
      resp.send({ count: newMesage });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/editMessage/",
  verifyToken,
  validatorHandler(updateMessageSchema, "body"),
  async (req, resp, next) => {
    try {
      const body = req.body.data;
      const { id } = body;
      const messageUpdated = await service.updateMessage(id, body);
      handleLogs(file, `Updating the message with id:${id}`);
      resp.setHeader("token", req.token);
      resp.jsonp({ result: messageUpdated });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/updateMessageCategories/",
  verifyToken,
  validatorHandler(getMessageSchema, "body"),
  async (req, resp, next) => {
    try {
      const { id, categories } = req.body.data;
      const messageToUpdate = await service.updateMessageCategories(
        id,
        categories
      );
      handleLogs(
        file,
        `Updating the category of the message with id:${id} to these ones:${categories.toString()}`
      );
      resp.setHeader("token", req.token);
      resp.json({ result: messageToUpdate });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/deleteMessage",
  verifyToken,
  validatorHandler(getMessageSchema, "body"),
  async (req, resp, next) => {
    try {
      const { id } = req.body.data;

      const messageToDelete = await service.deleteMessage(id);
      handleLogs(
        file,
        `Message with the id:${id} was marked as inactive or destroyed`
      );
      resp.setHeader("token", req.token);
      resp.jsonp({ result: messageToDelete });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/deleteMessages",
  verifyToken,
  validatorHandler(getMessageSchema, "body"),
  async (req, resp, next) => {
    try {
      const { id } = req.body.data;
     
      
      const messageToDelete = await service.deleteMessages(id);
      handleLogs(
        file,
        `Messages with the id:${id} were marked as inactives or destroyed`
      );
      resp.setHeader("token", req.token);
      resp.jsonp({ result: messageToDelete });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/associate_contact/",
  verifyToken,
  validatorHandler(updateMessageSchema, "body"),
  async (req, resp, next) => {
    try {
      const body = req.body.data;
      const { id, asociateTo } = body;
      const messageUpdated = await service.updateMessageAsociation(
        id,
        asociateTo
      );
      handleLogs(
        file,
        `Message with the id:${id} was successful associate to ${asociateTo}`
      );
      resp.setHeader("token", req.token);
      resp.jsonp(messageUpdated);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/messagesAsociation/:id",
  verifyToken,
  validatorHandler(getMessageSchema, "params"),
  async (req, resp, next) => {
    try {
      const { id } = req.params;
      const contactsAsociate = await service.findAsociateTo(id);
      const response = contactsAsociate;
      resp.setHeader("token", req.token);
      resp.json(response);
    } catch (error) {
      next(error);
      resp.status(422);
    }
  }
);

router.get(
  "/messagesAssociated/:contact",
  verifyToken,
  validatorHandler(getMessageSchema, "params"),
  async (req, resp, next) => {
    try {
      const { contact } = req.params;
      const messagesAssociated = await service.findMessagesAssociated(contact);
      resp.setHeader("token", req.token);
      resp.json({ result: messagesAssociated });
    } catch (error) {
      next(error);
      resp.status(422);
    }
  }
);

router.get(
  "/getMessage/:id",
  verifyToken,
  validatorHandler(getMessageSchema, "params"),
  async (req, resp, next) => {
    try {
      const { id } = req.params;
      const message = await service.findOne(id);
      resp.setHeader("token", req.token);
      resp.json(message);
    } catch (error) {
      next(error);
      resp.status(422);
    }
  }
);

router.get(
  "/getMesageAssociateAtCategory/:id:name",
  verifyToken,
  validatorHandler(getCategorySchema, "params"),
  async (req, resp, next) => {
    try {
      const { id, name } = req.params;
      const messageToUpdate = await service.getMesageAssociateAtCategory(
        id,
        name
      );
      resp.setHeader("token", req.token);
      resp.json({ result: messageToUpdate });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
