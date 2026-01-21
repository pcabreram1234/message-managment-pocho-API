const { initSequelize } = require("../libs/sequelize");
const { Op } = require("sequelize");
const boom = require("@hapi/boom");

class MessageService {
  async _getModels() {
    const sequelize = await initSequelize();
    return sequelize.models;
  }

  async find(user_id) {
    const { Message, Category, Contact } = await this._getModels();
    const rta = await Message.findAll({
      where: { UserId: user_id },
      include: [
        {
          model: Category,
          attributes: ["categorie_name", "id"],
          through: { attributes: [] },
        },
        {
          model: Contact,
          attributes: ["email", "id"],
          through: { attributes: [] },
        },
      ],
    });
    return rta;
  }

  async findOne(id) {
    const { Message, Category, Contact } = await this._getModels();
    const rta = await Message.findOne({
      where: { id: id },
      include: [
        {
          model: Category,
          attributes: ["categorie_name", "id"],
          through: { attributes: [] },
        },
        {
          model: Contact,
          attributes: ["email", "id"],
          through: { attributes: [] },
        },
      ],
    });
    return rta;
  }

  async addMessage(body) {
    const { Message, messages_contacts, messages_categories } =
      await this._getModels();
    /* Ejecutamos la consulta para agregar la BD */
    const { message, categories, associateTo, userId } = body;

    const rta = await Message.create({
      message: message,
      UserId: userId,
    });

    associateTo?.forEach(async (contact) => {
      const rtaMessageContacts = await messages_contacts.create({
        MessageId: rta.getDataValue("id"),
        ContactId: contact.id,
      });
    });

    categories?.forEach(async (category) => {
      const rtaInsertMessagesCategories = await messages_categories.create({
        CategoryId: category.id,
        MessageId: rta.getDataValue("id"),
      });
    });

    return rta.getDataValue("id");
  }

  async returnRowCount(attr, rta) {
    const { Message } = await this._getModels();
    const row = await Message.findAndCountAll({
      where: { id: rta.getDataValue(attr) },
    });
    return row.count;
  }

  async updateMessage(id, data) {
    const { Message, messages_contacts, messages_categories } =
      await this._getModels();
    if ((await this.find(id)) !== null) {
      const rta = await Message.update(
        {
          message: data.message,
        },
        { where: { id: id } },
      );

      const rtaDeleteMessagesContacts = await messages_contacts.destroy({
        where: { MessageId: id },
        force: true,
      });

      const rtaInsertMessagesContacts = await messages_contacts.bulkCreate(
        data.Contacts.map((contact) => {
          return { ContactId: contact.id, MessageId: id };
        }),
      );

      const rtaDeleteMessagesCategories = await messages_categories.destroy({
        where: { MessageId: id },
        force: true,
      });

      const rtaInsertMessagesCategories = await messages_categories.bulkCreate(
        data.Categories.map((category) => ({
          CategoryId: category.id,
          MessageId: id,
        })),
      );
      const result = rta == 1 ? 1 : boom.badData("Message can not be modified");
      return result;
    } else {
      boom.notFound("Message not Found, try again");
    }
  }

  async updateMessageCategories(id, categories) {
    const { Message } = await this._getModels();
    const rta = await Message.update(
      { categories: categories },
      {
        where: { id: id },
      },
    );
    return rta;
  }

  async getMesageAssociateAtCategory(id) {
    const { messages_categories } = await this._getModels();
    const rta = await messages_categories.findAndCountAll({
      where: {
        categories: {
          [Op.substring]: [id],
        },
      },
    });
    return rta;
  }

  async deleteMessage(ids) {
    const { Message, messages_categories, messages_contacts } =
      await this._getModels();

    const deleteMessages = await Message.destroy({
      where: {
        id: {
          [Op.in]: [ids],
        },
      },
    });

    const deleteMessagesCategories = await messages_categories.destroy({
      where: {
        MessageId: ids.map((id) => id.toString()),
      },
      force: true,
    });

    const deleteMessagesContacts = await messages_contacts.destroy({
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
    const { Message, messages_categories, messages_contacts } =
      await this._getModels();
    if (!Array.isArray(ids)) {
      ids = [ids];
    }
    const rta = await Message.destroy({
      where: { id: { [Op.in]: ids } },
    });

    const rtaDeleteMessagesCategories = await messages_categories.destroy({
      where: {
        MessageId: {
          [Op.in]: ids,
        },
      },
      force: true,
    });

    const rtaDeleteMessagesContacts = await messages_contacts.destroy({
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
    const { Message } = await this._getModels();
    if (this.find(id) !== null) {
      const rta = await Message.update(
        {
          associate_to: data,
        },
        {
          where: {
            id: id,
          },
        },
      );
      const result = rta == 1 ? 1 : boom.badData("Message can not be modified");
      return result;
    } else {
      boom.notFound("Message not Found, try again");
    }
  }

  async findAsociateTo(id) {
    const { Message } = await this._getModels();
    const rta = await Message.findAll({
      attributes: ["associate_to"],
      where: { id: id },
    });
    return rta;
  }

  async findMessagesAssociated(id) {
    const { Message, Contact } = await this._getModels();
    const rta = await Message.findAndCountAll({
      include: {
        model: Contact,
        where: { id: { [Op.substring]: id } },
      },
    });
    return rta;
  }

  async getCategoriesAsociate(id) {
    const { Message, Category } = await this._getModels();
    const rta = await Message.findOne({
      where: { id },
      include: [
        {
          model: Category,
          through: { attributes: [] }, // no incluir columnas de tabla intermedia
          attributes: ["categorie_name"], // atributos de la tabla Category
        },
      ],
    });

    // Solo devolver los nombres si los necesitas en limpio
    return rta?.Categories?.map((cat) => cat.categorie_name) ?? [];
  }
}

module.exports = { MessageService };
