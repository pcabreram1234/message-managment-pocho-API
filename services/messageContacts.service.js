const { models } = require("../libs/sequelize");

class MessageContactsService {
  async find(userId) {
    const rta = await models.Message.findAll({
      where: { UserId: userId, id: 1 },
      attributes: [],
      include: [
        {
          model: models.Contact,
          attributes: ["name", "id", "email"],
          through: { attributes: [] },
        },
      ],
    });

    return rta[0].Contacts;
  }
}

module.exports = { MessageContactsService };
