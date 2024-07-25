const Joi = require("joi");
const user = Joi.string().min(3);
const token = Joi.string().min(10);
const password = Joi.string().min(8);

const logInSchema = Joi.object({
  user: user.required,
  password: password.required,
});

const logOutSchhema = Joi.object({
  user: user.required,
  token: token.required,
});

const verifyUserSchema = Joi.object({
  token: token.required,
});

module.exports = { logInSchema, logOutSchhema, verifyUserSchema };
