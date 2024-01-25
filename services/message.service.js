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
          attributes: ["email", "id"],
          through: { attributes: [] },
        },
      ],
    });
    return rta;
  }

  async findOne(id) {
    const rta = await models.Message.findOne({
      where: { id: id },
      include: [
        {
          model: models.Category,
          attributes: ["categorie_name", "id"],
          through: { attributes: [] },
        },
        {
          model: models.Contact,
          attributes: ["email", "id"],
          through: { attributes: [] },
        },
      ],
    });
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
      const rtaDeleteMessagesContacts = await models.messages_contacts.destroy({
        where: { MessageId: id },
      });

      const rta = await models.Message.update(
        {
          message: data.message,
        },
        { where: { id: id } }
      );

      const rtaInsertMessagesContacts =
        await models.messages_contacts.bulkCreate(
          data.associate_to.map((contact) => ({
            ContactId: contact.id,
            MessageId: id,
          }))
        );

      const rtaDeleteMessagesCategories =
        await models.messages_categories.destroy({
          where: { MessageId: id },
        });

      const rtaInsertMessagesCategories =
        await models.messages_categories.bulkCreate(
          data.categories.map((category) => ({
            CategoryId: category.id,
            MessageId: id,
          }))
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
    const rta = await models.messages_categories.findAndCountAll({
      where: {
        categories: {
          [Op.substring]: [id],
        },
      },
    });
    return rta;
  }

  async deleteMessage(ids) {
    console.log(ids);
    if (this.find(id) !== null) {
      const rta = await models.Message.destroy({
        where: { id: id },
        limit: 1,
      });
      const rtaDeleteMessagesCategories =
        await models.messages_categories.destroy({ where: { MessageId: id } });
      const rtaDeleteMessagesContacts = await models.messages_contacts.destroy({
        where: { MessageId: id },
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

    const rtaDeleteMessagesCategories =
      await models.messages_categories.destroy({
        where: {
          MessageId: {
            [Op.in]: ids,
          },
        },
      });

    const rtaDeleteMessagesContacts = await models.messages_contacts.destroy({
      where: {
        MessageId: {
          [Op.in]: ids,
        },
      },
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

  async findMessagesAssociated(id) {
    const rta = await models.Message.findAndCountAll({
      include: {
        model: models.Contact,
        where: { id: { [Op.substring]: id } },
      },
    });
    return rta;
  }
}

module.exports = { MessageService };
