const { models } = require("../libs/sequelize");
const { Op } = require("sequelize");
const boom = require("@hapi/boom");

class ContactService {
  async find(userId) {
    const rta = await models.Contact.findAll({
      where: {
        UserId: userId,
      },
    });
    return rta;
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
          individualHooks: true,
        }
      );
      // const result = rta[0] == 1 ? 1 : boom.badData("Contact can not be modified");
      return rta[0];
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

  async verifyExtingContacts(data, userId) {
    const allNames = data.map((r) => r?.name).filter(Boolean);
    const allPhones = data.map((r) => r?.phone_number).filter(Boolean);
    const allEmails = data.map((r) => r?.email).filter(Boolean);
    const conditions = [];

    if (allNames.length > 0) {
      conditions.push({ name: { [Op.in]: allNames } });
    }
    if (allPhones.length > 0) {
      conditions.push({ phone_number: { [Op.in]: allPhones } });
    }
    if (allEmails.length > 0) {
      conditions.push({ email: { [Op.in]: allEmails } });
    }

    const notToUpLoadContacts = await models.Contact.findAll({
      where: {
        UserId: userId,
        [Op.or]: conditions,
      },
    });

    const namesFound = new Set((notToUpLoadContacts || []).map((n) => n.name));
    const phonesFound = new Set(
      (notToUpLoadContacts || []).map((n) => n.phone_number)
    );
    const emailsFound = new Set(
      (notToUpLoadContacts || []).map((n) => n.email)
    );

    return data
      .filter(
        (d) =>
          !namesFound.has(d.name) &&
          !phonesFound.has(d.phone_number) &&
          !emailsFound.has(d.email)
      )
      .map((el) => ({
        name: el?.name,
        email: el?.email,
        phone_number: el?.phone_number,
        UserId: userId,
      }));
  }

  async uploadContacts(data, userId) {
    const contactsToInsert = await this.verifyExtingContacts(data, userId);
    const newContacts = await models.Contact.bulkCreate(contactsToInsert);
    return { newContacts };
  }
}

module.exports = { ContactService };
