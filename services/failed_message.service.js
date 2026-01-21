const { initSequelize } = require("../libs/sequelize");
const { Op } = require("sequelize");

class FailedMessageService {
  async _getModels() {
    const sequelize = await initSequelize();
    return sequelize.models;
  }
  async findFailedMessages(userId) {
    const { FailedMessage } = await this._getModels();
    const rta = await FailedMessage.findAll({
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
    const { FailedMessage } = await this._getModels();
    const rta = await FailedMessage.findAll({
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
    const { FailedMessage } = await this._getModels();
    const rta = await FailedMessage.findByPk(id, {
      attributes: ["message_content"],
    });

    return rta;
  }

  async getFailedMessagesToDownload(id, userId) {
    const { FailedMessage, Contact } = await this._getModels();
    const rta = await FailedMessage.findByPk(id, {
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
    const rtaContact = await Contact.findOne({
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
    const { FailedMessage, MessageConfig } = await this._getModels();
    const { failedMessageId, messageConfigId, userId } = data;

    const whereClause = {
      id: failedMessageId,
      user_id: userId,
    };

    if (messageConfigId !== null && messageConfigId !== "null") {
      whereClause.MessageConfig_Id = messageConfigId;
    }

    const rtaFailedMessage = await FailedMessage.destroy({
      where: whereClause,
    });

    if (whereClause.MessageConfig_Id) {
      const rtaMessageConfig = await MessageConfig.destroy({
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
