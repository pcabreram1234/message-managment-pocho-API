const express = require("express");
const { ContactService } = require("../services/contact.service");
const { validatorHandler } = require("../middlewares/validator.handler");
const {
  createContactSchema,
  updateContactSchema,
  getContactSchema,
} = require("../schemas/contact.Schemas");
const { writeToLogFile } = require("../middlewares/error.handler");
const { verifyToken } = require("../middlewares/auth.handler");
const router = express.Router();
const service = new ContactService();

router.get("/", verifyToken, async (req, resp, next) => {
  try {
    const contacts = await service.find(req.user.id);
    resp.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/contactsEmail", verifyToken, async (req, resp, next) => {
  try {
    const contacts = await service.find(req.user.id);
    resp.json(
      contacts.map((contact) => {
        return contact.email;
      })
    );
  } catch (error) {
    next(error);
  }
});

router.post("/distinctContacts", verifyToken, async (req, resp, next) => {
  try {
    const contactsId = req.body.data.map((contact) => contact.id);
    const contacts = await service.findDistinctContacts(
      req.user.id,
      contactsId
    );

    return resp.json({ contacts });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/addContact",
  verifyToken,
  validatorHandler(createContactSchema, "body"),
  async (req, resp, next) => {
    try {
      const { data } = req.body;
      const id = req.user.id;
      const newContact = await service.addContact({ ...data, UserId: id });
      resp.json({ result: newContact });
    } catch (error) {
      resp.status(400);
      next(error);
    }
  }
);

router.post(
  "/editContact",
  verifyToken,
  validatorHandler(updateContactSchema, "body"),
  async (req, resp, next) => {
    try {
      const body = req.body.data;
      const editContact = await service.editContact(body);
      resp.json({ result: editContact });
    } catch (error) {
      next(error);
      resp.status(400);
    }
  }
);

router.delete(
  "/deleteContact",
  verifyToken,
  validatorHandler(getContactSchema, "body"),
  async (req, resp, next) => {
    try {
      const id = req.body.data;
      const deleteContact = await service.deleteContact(id);
      resp.json({ result: deleteContact });
    } catch (error) {
      next(error);
      resp.status(422);
    }
  }
);

router.delete(
  "/deleteContacts",
  verifyToken,
  validatorHandler(getContactSchema, "body"),
  async (req, resp, next) => {
    try {
      const id = req.body.data;
      const deleteContacts = await service.deleteContacts(id);
      resp.json({ result: deleteContacts });
    } catch (error) {
      next(error);
      resp.status(422);
    }
  }
);

module.exports = router;
