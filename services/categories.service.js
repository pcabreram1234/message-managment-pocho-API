const { models } = require("../libs/sequelize");
const { Op, Sequelize } = require("sequelize");
class CategoryService {
  async find(id) {
    const rta = await models.Category.findAll({
      where: {
        UserId: id,
      },
    });
    return rta;
  }

  async findAsociateTo(id) {
    const rta = await models.Category.findAll({
      where: { id: id },
    });
    return rta;
  }

  async findByName(name, UserId) {
    const rta = await models.Category.findAndCountAll({
      where: {
        categorie_name: name,
        UserId: UserId,
      },
      limit: 1,
    });
    return rta;
  }

  async addCategory(data) {
    const rta = await models.Category.create(data);
    return rta;
  }

  async editCategory(data) {
    const { id, categorie_name } = data;
    const rta = await models.Category.update(
      {
        categorie_name: categorie_name,
      },
      {
        where: {
          id: id,
        },
        individualHooks: true,
      }
    );
    return rta;
  }

  async deleteCategory(data) {
    const { user_id, id } = data;
    const rta = await models.Category.destroy({
      where: { id: id, UserId: user_id },
    });
    return rta;
  }

  async deleteCategories(ids) {
    const rta = await models.Category.destroy({
      where: { id: { [Op.or]: ids } },
    });
    return rta;
  }

  async getDistinctCategories(categories, userId) {
    let rta;
    let categoriesIds = [];
    if (typeof categories !== "string") {
      categories.forEach((category) => {
        categoriesIds.push(category.id);
      });
      rta = await models.Category.findAll({
        where: { id: { [Op.notIn]: categoriesIds }, UserId: userId },
        attributes: ["categorie_name", "id"],
      });
    }
    return rta;
  }
}

module.exports = { CategoryService };
