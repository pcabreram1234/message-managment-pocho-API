const { initSequelize } = require("../libs/sequelize");
const { Op } = require("sequelize");
class CategoryService {
  async _getModels() {
    const sequelize = await initSequelize();
    return sequelize.models;
  }
  async find(id) {
    const { Category } = await this._getModels();
    const rta = await Category.findAll({
      where: {
        UserId: id,
      },
    });
    return rta;
  }

  async findAsociateTo(id) {
    const { Category } = await this._getModels();
    const rta = await Category.findAll({
      where: { id: id },
    });
    return rta;
  }

  async findByName(name, UserId) {
    const { Category } = await this._getModels();
    const rta = await Category.findAndCountAll({
      where: {
        categorie_name: name,
        UserId: UserId,
      },
      limit: 1,
    });
    return rta;
  }

  async addCategory(data) {
    const { Category } = await this._getModels();
    const rta = await Category.create(data);
    return rta;
  }

  async editCategory(data) {
    const { Category } = await this._getModels();
    const { id, categorie_name } = data;
    const rta = await Category.update(
      {
        categorie_name: categorie_name,
      },
      {
        where: {
          id: id,
        },
        individualHooks: true,
      },
    );
    return rta;
  }

  async deleteCategory(data) {
    const { Category } = await this._getModels();
    const { user_id, id } = data;
    const rta = await Category.destroy({
      where: { id: id, UserId: user_id },
    });
    return rta;
  }

  async deleteCategories(ids) {
    const { Category } = await this._getModels();
    const rta = await Category.destroy({
      where: { id: ids },
    });
    return rta;
  }

  async getDistinctCategories(categories, userId) {
    const { Category } = await this._getModels();
    let rta;
    let categoriesIds = [];
    if (typeof categories !== "string") {
      categories.forEach((category) => {
        categoriesIds.push(category.id);
      });
      rta = await Category.findAll({
        where: { id: { [Op.notIn]: categoriesIds }, UserId: userId },
        attributes: ["categorie_name", "id"],
      });
    }
    return rta;
  }
}

module.exports = { CategoryService };
