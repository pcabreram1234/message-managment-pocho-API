const { Category } = require("../models/Categories");

const initCategoryHooks = async () => {
  Category.addHook("beforeCreate", async (category, options) => {
    console.log(category);
    const existCategory = await Category.findAndCountAll({
      where: {
        categorie_name: category.categorie_name,
        UserId: category.UserId,
      },
    });

    if (existCategory.count > 0) {
      throw new Error("This Category already exists");
    }
  });

  Category.addHook("beforeUpdate", async (category, options) => {
    const existCategory = await Category.findAndCountAll({
      where: {
        categorie_name: category.categorie_name,
        UserId: category.UserId,
      },
    });

    if (existCategory.count > 0) {
      throw new Error("This Category already exists");
    }
  });
};

module.exports = { initCategoryHooks };
