const { models } = require("../libs/sequelize");
const { Op } = require("sequelize");

class FailedMessageService {
  async findFailedMessages(userId) {
    const rta = await models.FailedMessage.findAll({
      where: {
        user_id: userId,
        status: {
          [Op.in]: ["Error", "Permanent Failure"],
        },
      },
      attributes: [
        "id",
        "recipient",
        "message_content",
        "scheduled_date",
        "error_message",
        "status",
      ],
    });
    return rta;
  }

  async getShippmentHistory(userId) {
    const rta = await models.FailedMessage.findAll({
      where: {
        user_id: userId,
      },
      attributes: [
        "id",
        "recipient",
        "message_content",
        "scheduled_date",
        "error_message",
        "status",
        "attempts",
        "channel",
        "MessageConfig_Id",
      ],
    });
    return rta;
  }

  async getFailedMessage(id) {
    const rta = await models.FailedMessage.findByPk(id, {
      attributes: ["message_content"],
    });

    return rta;
  }

  async getFailedMessagesToDownload(id, userId) {
    const rta = await models.FailedMessage.findByPk(id, {
      attributes: [
        "id",
        "recipient",
        "message_content",
        "attempts",
        "error_message",
        "status",
        "updatedAt",
        "scheduled_date",
        "channel",
      ],
    });
    const rtaContact = await models.Contact.findOne({
      where: {
        email: rta.recipient,
        Userid: userId,
      },
      attributes: ["name", "email"],
    });

    const { name } = rtaContact;

    return { ...rta.dataValues, name };
  }

  async stopMessageSent(data) {
    const { failedMessageId, messageConfigId, userId } = data;

    const whereClause = {
      id: failedMessageId,
      user_id: userId,
    };

    if (messageConfigId !== null && messageConfigId !== "null") {
      whereClause.MessageConfig_Id = messageConfigId;
    }

    const rtaFailedMessage = await models.FailedMessage.destroy({
      where: whereClause,
    });

    if (whereClause.MessageConfig_Id) {
      const rtaMessageConfig = await models.MessageConfig.destroy({
        where: {
          id: whereClause.MessageConfig_Id,
        },
      });
    }

    return {
      result: "Message Stoped",
    };
  }
}

module.exports = { FailedMessageService };
