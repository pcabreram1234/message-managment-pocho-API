const { models } = require("../libs/sequelize");
const { Op } = require("sequelize");

class ContactService {
  async find(userId) {
    const rta = await models.User.findOne({
      attributes: [],
      where: { id: userId },
      include: {
        model: models.Contact,
        attributes: ["email", "id", "name", "phone_number"],
        through: { attributes: [] },
      },
    });
    return rta.Contacts;
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

  async findByEmail(email) {
    existInUserContact;
    const rta = await models.Contact.findOne({ where: { email: email } });
    return rta;
  }

  async findInUserContact(UserId, ContactId) {
    const rta = await models.UserContacts.findOne({
      where: { UserId: UserId, ContactId: ContactId },
    });
    return rta;
  }

  async addContact(body) {
    // Primero verificar si dicho contacto existe en la tabla Contacts
    // Si existe verificar si existe tambien en la tabla UsersContacts
    // Si existe en la tabla Contacts pero en la tbala UsersContacts no con ese UserId Agregarlo en esta última
    // Si existe en las dos tablas y en la tabla UsersContacts con ese mismo UserId lanzar error de que ya está guardado
    // Si no existe en la tabla UsersContacts con ese UserId agregarlo
    //

    const existContact = await this.findByEmail(body.email);
    if (existContact !== null) {
      const existInUserContact = await this.findInUserContact(
        existContact.UserId,
        existContact.id
      );
      if (existInUserContact !== null) {
        boom.locked("This contact already exist");
      } else {
        const addContactInUserContact = await models.UserContacts.create({
          UserId: body.UserId,
          ContactId: existContact.id,
        });
        return addContactInUserContact;
      }
    } else {
      const rta = await models.Contact.create(body).then(async (resp) => {
        const addContactInUserContact = await models.UserContacts.create({
          UserId: resp.UserId,
          ContactId: resp.ContactId,
        });
        return rta;
      });
    }
  }

  async editContact(body) {
    const { id, name, phone, categories } = body;
    if (this.findOne(id) !== null) {
      const rta = await models.Contact.update(
        {
          name: name,
          phone_number: phone,
          categories: categories,
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
    return rta;
  }
}

module.exports = { ContactService };
