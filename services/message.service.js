const { models } = require("../libs/sequelize");
const { Op, Model } = require("sequelize");
const boom = require("@hapi/boom");

class MessageService {
  async find(user_id) {
    const rta = await models.Message.findAll({
      where: { UserId: user_id },
      include: [
        {
          model: models.Category,
          attributes: ["categorie_name", "id"],
          through: { attributes: [] },
        },
        {
          model: models.Contact,
          attributes: ["email","id"],
          through: { attributes: [] },
        },
      ],
    });
    return rta;
  }

  async findOne(id) {
    const rta = await models.Message.findByPk(id);
    return rta;
  }

  async addMessage(body) {
    /* Ejecutamos la consulta para agregar la BD */
    const { message, categories, associateTo, userId } = body;
    const rta = await models.Message.create({
      message: message,
      categories: categories,
      associate_to: associateTo,
      UserId: userId,
    });
    /* Retornamos las columnas afectadas por esta transaccion */
    /* A pesar de haber colocado el return en el metodo returnRowCount
es necesario que en este metodo tambien se retorne */
    return this.returnRowCount("id", rta);
  }

  async returnRowCount(attr, rta) {
    const row = await models.Message.findAndCountAll({
      where: { id: rta.getDataValue(attr) },
    });
    return row.count;
  }

  async updateMessage(id, data) {
    if (this.find(id) !== null) {
      const rta = await models.Message.update(
        {
          message: data.message,
          categories: data.categories,
          associate_to: data.associate_to,
        },
        { where: { id: id } }
      );
      const result = rta == 1 ? 1 : boom.badData("Message can not be modified");
      return result;
    } else {
      boom.notFound("Message not Found, try again");
    }
  }

  async updateMessageCategories(id, categories) {
    const rta = await models.Message.update(
      { categories: categories },
      {
        where: { id: id },
      }
    );
    return rta;
  }

  async getMesageAssociateAtCategory(id) {
    const rta = await models.Message.findAndCountAll({
      where: {
        categories: {
          [Op.substring]: [id],
        },
      },
    });
    return rta;
  }

  async deleteMessage(id) {
    if (this.find(id) !== null) {
      const rta = await models.Message.destroy({
        where: { id: id },
        limit: 1,
      });
      const result = rta == 1 ? 1 : boom.badRequest("Messsage not found");
      return result;
    } else {
      boom.notFound("Message not Found, try again");
    }
  }

  async deleteMessages(ids) {
    const rta = await models.Message.destroy({
      where: { id: { [Op.or]: ids } },
    });
    return rta;
  }

  async updateMessageAsociation(id, data) {
    if (this.find(id) !== null) {
      const rta = await models.Message.update(
        {
          associate_to: data,
        },
        {
          where: {
            id: id,
          },
        }
      );
      const result = rta == 1 ? 1 : boom.badData("Message can not be modified");
      return result;
    } else {
      boom.notFound("Message not Found, try again");
    }
  }

  async findAsociateTo(id) {
    const rta = await models.Message.findAll({
      attributes: ["associate_to"],
      where: { id: id },
    });
    return rta;
  }

  async findMessagesAssociated(contact) {
    const rta = await models.Message.findAndCountAll({
      where: { associate_to: { [Op.substring]: contact } },
    });
    return rta;
  }
}

module.exports = { MessageService };
