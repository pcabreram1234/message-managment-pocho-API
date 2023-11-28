const express = require("express");
const {
  MessageContactsService,
} = require("../services/messageContacts.service");
const { handleLogs } = require("../utils/handleLogs");
const { file } = require("../utils/globals");
const { verifyToken } = require("../middlewares/auth.handler");
const router = express.Router();
const service = new MessageContactsService();
require("dotenv").config();

router.get("/", verifyToken, async (req, resp, next) => {
  try {
    const contacts = await service.find(req.user.id);
    /* Añadiendo al log el resultado de la operación exitosa */
    // handleLogs(file, `Fetching ${contacts.length} messages`);
    resp.setHeader("token", req.token);
    resp.json({ result: contacts });  
  } catch (error) {
    next(error);
  }
});

module.exports = router;
