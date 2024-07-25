const Joi = require("joi");
const id = Joi.number().integer();
const categorie_name = Joi.string().min(3);
const associate_to = Joi.string().min(3);
const userId = Joi.number().integer();

const getCategorySchema = Joi.object({
  id: id.required,
  userId: userId.required,
});

const getCategoryNameSchema = Joi.object({
  name: categorie_name.required,
  userId: userId.required,
});

const createCategorySchema = Joi.object({
  name: categorie_name,
  associate_to: associate_to,
  userId: userId.required,
});

const updateCategorySchema = Joi.object({
  id: id.required,
  name: categorie_name,
  associate_to: associate_to,
  userId: userId.required,
});

module.exports = {
  getCategorySchema,
  createCategorySchema,
  updateCategorySchema,
  getCategoryNameSchema,
};
