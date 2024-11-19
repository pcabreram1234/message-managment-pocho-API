const Joi = require("joi");
const name = Joi.string().length(6);
const contrasena = Joi.string().min(8);
const token = Joi.string().regex(
  /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
);

const getUserSchema = Joi.object({
  name: name.required(),
  contrasena: contrasena.required(),
});

const jwtSchema = Joi.object({
  token: token.required(),
});

module.exports = {
  getUserSchema,
  jwtSchema,
};
