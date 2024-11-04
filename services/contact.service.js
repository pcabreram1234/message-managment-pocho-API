const { models } = require("../libs/sequelize");
const { Op } = require("sequelize");

class ContactService {
  async find(userId) {
    const rta = await models.User.findAll({
      where: { id: userId },
      attributes: [],
      include: {
        model: models.Contact,
        through: { attributes: [] },
      },
    });
    return rta[0].Contacts;
  }

  async findOne(id) {
    const rta = await models.Contact.findByPk(id);
    return rta;
  }

  async findDistinctContacts(userId, contactsId) {
    const rta = await models.Contact.findAll({
      where: {
        id: {
          [Op.notIn]: [contactsId],
        },
        UserId: userId,
      },
      attributes: ["email", "id"],
    });
    return rta;
  }

  async returnRowCount(attr, rta) {
    const row = await models.Message.findAndCountAll({
      where: { id: rta.getDataValue(attr) },
    });
    return row.count;
  }

  async findByEmail(email, UserId) {
    const rta = await models.Contact.findOne({
      where: { email: email, UserId: UserId },
    });
    return rta;
  }

  async findInUserContact(UserId, ContactId) {
    const rta = await models.UserContacts.findOne({
      where: { UserId: UserId, ContactId: ContactId },
    });
    return rta;
  }

  async addContact(body) {
    const newContact = await models.Contact.create(body);
    return newContact;
  }

  async editContact(body) {
    const { id, name, phone, categories, email } = body;
    if (this.findOne(id) !== null) {
      const rta = await models.Contact.update(
        {
          name: name,
          phone_number: phone,
          categories: categories,
          email: email,
        },
        {
          where: { id: id },
        }
      );
      const result = rta == 1 ? 1 : boom.badData("Contact can not be modified");
      return result;
    } else {
      boom.notFound("Contact not Found, try again");
    }
  }

  async deleteContact(id) {
    const rta = await models.Contact.destroy({ where: { id: id } });
    return rta;
  }

  async deleteContacts(ids) {
    const rta = await models.Contact.destroy({
      where: { id: { [Op.or]: ids } },
    });

    const rtaContacts = await models.UserContact.destroy({
      where: {
        ContactId: {
          [Op.in]: ids,
        },
      },
    });
    return rta;
  }
}

module.exports = { ContactService };
