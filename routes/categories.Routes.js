const express = require("express");
const { CategoryService } = require("../services/categories.service");
const {
  getCategorySchema,
  getCategoryNameSchema,
} = require("../schemas/Category.Schemas");
const { validatorHandler } = require("../middlewares/validator.handler");
const { file } = require("../utils/globals");
const { handleLogs } = require("../utils/handleLogs");
const { verifyToken } = require("../middlewares/auth.handler");

const router = express.Router();
const service = new CategoryService();
require("dotenv").config();

router.get("/", verifyToken, async (req, resp, next) => {
  try {
    const categories = await service.find(req.user.id);
    handleLogs(file, `Fetching ${categories.length} categories`);
    resp.setHeader("token", req.token);
    resp.json({ categories: categories });
  } catch (error) {
    next(error);
  }
});

router.post("/distinctCategories", verifyToken, async (req, resp, next) => {
  try {
    const categories = req.body.data;
    const user_id = req.user.id;
    const distinctCategories = await service.getDistinctCategories(
      categories,
      user_id
    );
    resp.setHeader("token", req.token);
    resp.json(distinctCategories);
  } catch (error) {
    next(error);
  }
});

router.post("/addCategory", verifyToken, async (req, resp, next) => {
  try {
    const data = {
      categorie_name: req.body.data.categorie_name,
      UserId: req.user.id,
    };

    const newCategory = await service.addCategory(data);
    handleLogs(file, `Category:${data.categorie_name} was sucessful added`);
    resp.setHeader("token", req.token);
    resp.send(newCategory);
  } catch (error) {
    next(error);
  }
});

router.patch("/editCategory", verifyToken, async (req, resp, next) => {
  try {
    const data = req.body.data;
    const oldCateggory = await service.findAsociateTo(data.id).then((res) => {
      handleLogs(
        file,
        `Category with the id:${data.id} was sucessful modified from:${res[0].categorie_name} to:${data.categorie_name}`
      );
    });
    const categoryUpdated = await service.editCategory(data);
    resp.json({ result: categoryUpdated[0] });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/categoriesAsociation/:id",
  verifyToken,
  validatorHandler(getCategorySchema, "params"),
  async (req, resp, next) => {
    try {
      const { id } = req.params;
      const contactsAsociate = await service.findAsociateTo(id);
      const response = contactsAsociate;
      resp.json(response);
    } catch (error) {
      next(error);
      resp.status(422);
    }
  }
);

router.get(
  "/categoriesName/:name",
  verifyToken,
  validatorHandler(getCategoryNameSchema, "params"),
  async (req, resp, next) => {
    try {
      const { name } = req.params;
      const verifyCategory = await service.findByName(name, req.user.id);
      resp.json({ result: verifyCategory });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/deleteCategory",
  verifyToken,
  validatorHandler(getCategorySchema, "body"),
  async (req, resp, next) => {
    try {
      const data = {
        user_id: req.user.id,
        id: req.body.data,
      };
      const deleteCategory = await service.deleteCategory(data);
      handleLogs(
        file,
        `Category with the id:${data.id} was marked as inactives or destroyed`
      );
      resp.json({ result: deleteCategory });
    } catch (error) {
      next(error);
      resp.status(422);
    }
  }
);

router.delete(
  "/deleteCategories",
  verifyToken,
  validatorHandler(getCategorySchema, "body"),
  async (req, resp, next) => {
    try {
      const id = req.body.data;
      const deleteContacts = await service.deleteCategories(id);
      handleLogs(
        file,
        `Categories with the ids:${id} were marked as inactives or destroyed`
      );
      resp.json({ result: deleteContacts });
    } catch (error) {
      next(error);
      resp.status(422);
    }
  }
);

module.exports = router;
