const Joi = require("joi");
const name = Joi.string().min(3);
const id = Joi.number().integer();
const phone_number = Joi.number();
const categories = Joi.object();

const getContactSchema = Joi.object({
  id: id.required,
});

const createContactSchema = Joi.object({
  name: name,
  phoneNumber: phone_number,
  categories: categories,
});

const updateContactSchema = Joi.object({
  id: id.required,
  name: name,
  phoneNumber: phone_number,
  categories: categories,
});

module.exports = { getContactSchema, createContactSchema, updateContactSchema };
