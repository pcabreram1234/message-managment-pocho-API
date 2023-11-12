const Joi = require("joi");

const id = Joi.number().integer();
const message = Joi.string().min(3);
const categories = Joi.object();
const associate_to = Joi.object();

const creteMessageSchema = Joi.object({
  message: message.required(),
});

const updateMessageSchema = {
  id: id.required,
  message: message,
  categories: categories,
  associate_to: associate_to,
};

const getMessageSchema = {
  id: id.required,
};

module.exports = { creteMessageSchema, updateMessageSchema, getMessageSchema };
