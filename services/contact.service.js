const { initSequelize } = require("../libs/sequelize");
const { Op } = require("sequelize");
const boom = require("@hapi/boom");

class ContactService {
  async _getModels() {
    const sequelize = await initSequelize();
    return sequelize.models;
  }

  async findSimpleContacts(userId) {
    const { Contact } = await this._getModels();
    const rta = await Contact.findAll({
      where: {
        UserId: userId,
      },
      attributes: ["id", "email"],
    });
    return rta;
  }

  async find(userId) {
    const { Contact } = await this._getModels();
    const rta = await Contact.findAll({
      where: {
        UserId: userId,
      },
    });
    return rta;
  }

  async findOne(id) {
    const { Contact } = await this._getModels();
    const rta = await Contact.findByPk(id);
    return rta;
  }

  async findDistinctContacts(userId, contactsId) {
    const { Contact } = await this._getModels();
    const rta = await Contact.findAll({
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
    const { Message } = await this._getModels();
    const row = await Message.findAndCountAll({
      where: { id: rta.getDataValue(attr) },
    });
    return row.count;
  }

  async findByEmail(email, UserId) {
    const { Contact } = await this._getModels();
    const rta = await Contact.findOne({
      where: { email: email, UserId: UserId },
    });
    return rta;
  }

  async findInUserContact(UserId, ContactId) {
    const { UserContacts } = await this._getModels();
    const rta = await UserContacts.findOne({
      where: { UserId: UserId, ContactId: ContactId },
    });
    return rta;
  }

  async addContact(body) {
    const { Contact } = await this._getModels();
    const newContact = await Contact.create(body);
    return newContact;
  }

  async editContact(body) {
    const { id, name, phone, categories, email } = body;
    if (this.findOne(id) !== null) {
      const { Contact } = await this._getModels();
      const rta = await Contact.update(
        {
          name: name,
          phone_number: phone,
          categories: categories,
          email: email,
        },
        {
          where: { id: id },
          individualHooks: true,
        },
      );
      // const result = rta[0] == 1 ? 1 : boom.badData("Contact can not be modified");
      return rta[0];
    } else {
      boom.notFound("Contact not Found, try again");
    }
  }

  async deleteContact(id) {
    const { Contact } = await this._getModels();
    const rta = await Contact.destroy({ where: { id: id } });
    return rta;
  }

  async deleteContacts(ids) {
    const { Contact, UserContact } = await this._getModels();
    const rta = await Contact.destroy({
      where: { id: { [Op.or]: ids } },
    });

    const rtaContacts = await UserContact.destroy({
      where: {
        ContactId: {
          [Op.in]: ids,
        },
      },
    });
    return rta;
  }

  async verifyExtingContacts(data, userId) {
    const { Contact } = await this._getModels();
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

    const notToUpLoadContacts = await Contact.findAll({
      where: {
        UserId: userId,
        [Op.or]: conditions,
      },
    });

    const namesFound = new Set((notToUpLoadContacts || []).map((n) => n.name));
    const phonesFound = new Set(
      (notToUpLoadContacts || []).map((n) => n.phone_number),
    );
    const emailsFound = new Set(
      (notToUpLoadContacts || []).map((n) => n.email),
    );

    return data
      .filter(
        (d) =>
          !namesFound.has(d.name) &&
          !phonesFound.has(d.phone_number) &&
          !emailsFound.has(d.email),
      )
      .map((el) => ({
        name: el?.name,
        email: el?.email,
        phone_number: el?.phone_number,
        UserId: userId,
      }));
  }

  async uploadContacts(data, userId) {
    const { Contact } = await this._getModels();
    const contactsToInsert = await this.verifyExtingContacts(data, userId);
    const newContacts = await Contact.bulkCreate(contactsToInsert);
    return { newContacts };
  }
}

module.exports = { ContactService };
