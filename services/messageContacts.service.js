const { initSequelize } = require("../libs/sequelize");

class MessageContactsService {
  async _getModels() {
    const sequelize = await initSequelize();
    return sequelize.models;
  }

  async find(userId) {
    const { Message, Contact } = await this._getModels();
    const rta = await Message.findAll({
      where: { UserId: userId, id: 1 },
      attributes: [],
      include: [
        {
          model: Contact,
          attributes: ["name", "id", "email"],
          through: { attributes: [] },
        },
      ],
    });

    return rta[0].Contacts;
  }
}

module.exports = { MessageContactsService };
