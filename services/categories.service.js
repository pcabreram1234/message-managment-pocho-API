const { initSequelize } = require("../libs/sequelize");
const { Op, where } = require("sequelize");
class CategoryService {
  async _getModels() {
    const sequelize = await initSequelize();
    return sequelize.models;
  }
  async find(userId) {
    const sequelize = await initSequelize();
    const { Category } = await this._getModels();

    const categories = await Category.findAll({
      where: {
        UserId: userId,
      },
      attributes: {
        include: [
          // Count Messages via messages_categories
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM messages_categories mc
              WHERE mc.CategoryId = Category.id
            )`),
            "messages_count",
          ],

          // Count Campaigns via CategoryId
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM campaigns c
              WHERE c.CategoryId = Category.id
            )`),
            "campaigns_count",
          ],
        ],
      },
      order: [["categorie_name", "ASC"]],
    });

    return categories.map((category) => {
      const messagesCount = Number(category.getDataValue("messages_count"));
      const campaignsCount = Number(category.getDataValue("campaigns_count"));

      let associate_to = "none";

      if (messagesCount > 0 && campaignsCount > 0) {
        associate_to = "both";
      } else if (messagesCount > 0) {
        associate_to = "message";
      } else if (campaignsCount > 0) {
        associate_to = "campaign";
      }

      return {
        id: category.id,
        categorie_name: category.categorie_name,
        associate_to,
        messages_count: messagesCount,
        campaigns_count: campaignsCount,
        createdAt: category.createdAt,
      };
    });
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

  async getSimpleCategories(userId) {
    const { Category } = await this._getModels();
    const rta = await Category.findAll({
      where: { userId: userId },
      attributes: ["id", "categorie_name"],
    });
    return rta;
  }
}

module.exports = { CategoryService };
