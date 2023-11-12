const { models } = require("../libs/sequelize");
const { Op } = require("sequelize");

class ContactService {
  async find() {
    const rta = await models.Contact.findAll();
    return rta;
  }

  async findOne(id) {
    const rta = await models.Contact.findByPk(id);
    return rta;
  }

  async returnRowCount(attr, rta) {
    const row = await models.Message.findAndCountAll({
      where: { id: rta.getDataValue(attr) },
    });
    return row.count;
  }

  async addContact(body) {
    const { name, phone, categories, email, userId } = body;
    const rta = await models.Contact.create({
      name: name,
      phone_number: phone,
      categories: categories,
      email: email,
      UserId: userId,
    });
    return rta;
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
