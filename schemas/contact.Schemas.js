const Joi = require("joi");
const name = Joi.string().min(3);
const id = Joi.number().integer();
const phone_number = Joi.expression("/[0-9]{3}[-]{1}[0-9]{3}[-]{1}[0-9]{4}/");
const UserId = Joi.number();

const getContactSchema = Joi.object({
  id: id.required,
});

const createContactSchema = Joi.object({
  name: name.required(),
  phone_number: phone_number,
  UserId: UserId.required(),
});

const updateContactSchema = Joi.object({
  id: id.required,
  name: name,
  phone_number: phone_number,
});

module.exports = { getContactSchema, createContactSchema, updateContactSchema };
