const Joi = require("joi");
const name = Joi.string().min(3);
const id = Joi.number().integer();
const phone_number = Joi.string().pattern(/^[\d\s\-\(\).]{10,15}$/);
const UserId = Joi.number();
const mail = Joi.string().email();

const getContactSchema = Joi.object({
  id: id.required,
});

const createContactSchema = Joi.object({
  name: name.required(),
  phone_number: phone_number,
  UserId: UserId.required(),
  email: mail.required(),
});

const updateContactSchema = Joi.object({
  id: id.required,
  name: name,
  phone_number: phone_number,
  email: mail,
});

module.exports = { getContactSchema, createContactSchema, updateContactSchema };
