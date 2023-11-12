const Joi = require("@hapi/joi");

const date = new Date();

const id = Joi.number();
const user_id = Joi.number();
const message_id = Joi.number().integer();
const message = Joi.string().min(3);
const categories = Joi.array();
const send_to = Joi.array();
const send_on_date = Joi.date();

const create_message_configuration_schema = Joi.object({
  message_id: message_id.required(),
  message: message.required(),
  categories: categories,
  send_to: send_to.required(),
  send_on_date: send_on_date.required(),
  user_id: user_id.required(),
});

module.exports = { create_message_configuration_schema };
