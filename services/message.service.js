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
      UserId: userId,
    });

    // associateTo.forEach(async (contact) => {
    //   const rtaMessageContacts = await models.messages_contacts.create({
    //     MessageId: rta.getDataValue("id"),
    //     ContactId: contact.id,
    //   });
    // });

    // categories.forEach(async (category) => {
    //   const rtaInsertMessagesCategories =
    //     await models.messages_categories.create({
    //       CategoryId: category.id,
    //       MessageId: rta.getDataValue("id"),
    //     });
    // });

    return rta.getDataValue("id");
  }

  async returnRowCount(attr, rta) {
    const row = await models.Message.findAndCountAll({
      where: { id: rta.getDataValue(attr) },
    });
    return row.count;
  }

  async updateMessage(id, data) {
    if ((await this.find(id)) !== null) {
      const rta = await models.Message.update(
        {
          message: data.message,
        },
        { where: { id: id } }
      );

      const rtaDeleteMessagesContacts = await models.messages_contacts.destroy({
        where: { MessageId: id },
        force: true,
      });

      const rtaInsertMessagesContacts =
        await models.messages_contacts.bulkCreate(
          data.Contacts.map((contact) => {
            console.log(contact);
            return { ContactId: contact.id, MessageId: id };
          })
        );

      const rtaDeleteMessagesCategories =
        await models.messages_categories.destroy({
          where: { MessageId: id },
          force: true,
        });

      const rtaInsertMessagesCategories =
        await models.messages_categories.bulkCreate(
          data.Categories.map((category) => ({
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

    const deleteMessages = await models.Message.destroy({
      where: {
        id: {
          [Op.in]: [ids],
        },
      },
    });

    const deleteMessagesCategories = await models.messages_categories.destroy({
      where: {
        MessageId: ids.map((id) => id.toString()),
      },
      force: true,
    });

    const deleteMessagesContacts = await models.messages_contacts.destroy({
      where: { MessageId: ids.map((id) => id.toString()) },
      force: true,
    });

    console.log(`El resultado es ${deleteMessages}`);
    if (deleteMessages > 0) {
      return deleteMessages;
    } else {
      boom.notFound("Message not Found, try again");
    }
  }

  async deleteMessages(ids) {
    if (!Array.isArray(ids)) {
      ids = [ids];
    }
    const rta = await models.Message.destroy({
      where: { id: { [Op.in]: ids } },
    });

    const rtaDeleteMessagesCategories =
      await models.messages_categories.destroy({
        where: {
          MessageId: {
            [Op.in]: ids,
          },
        },
        force: true,
      });

    const rtaDeleteMessagesContacts = await models.messages_contacts.destroy({
      where: {
        MessageId: {
          [Op.in]: ids,
        },
      },
      force: true,
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
