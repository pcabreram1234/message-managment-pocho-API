const { initSequelize } = require("../libs/sequelize");
const { Op } = require("sequelize");

class CampaignsMessages {
  async _getModels() {
    const sequelize = await initSequelize();
    return sequelize.models;
  }

  async getCampaignMessagesToLaunch(campaign_id) {
    const { CampaignMessage } = await this._getModels();
    const rta = await CampaignMessage.findAll({
      where: {
        campaign_id: campaign_id,
      },
    });

    return rta;
  }

  async addMessagesToCampaign(data, userId) {
    const sequelize = await initSequelize();
    const { Campaign, CampaignMessage, Message } = sequelize.models;

    const { campaign_id, messageIds } = data;

    return sequelize.transaction(async (transaction) => {
      /* ===============================
         1. Validar campaña
      =============================== */
      const campaign = await Campaign.findOne({
        where: {
          id: campaign_id,
          UserId: userId,
        },
        transaction,
      });

      if (!campaign) {
        throw new Error("Campaign not found or not authorized");
      }

      /* ===============================
         2. Obtener mensajes base
      =============================== */
      const messages = await Message.findAll({
        where: {
          id: { [Op.in]: messageIds },
        },
        transaction,
      });

      if (!messages.length) {
        throw new Error("No valid messages provided");
      }

      /* ===============================
         3. Evitar duplicados
      =============================== */
      const existingMessages = await CampaignMessage.findAll({
        where: {
          campaign_id,
          MessageId: { [Op.in]: messageIds },
        },
        attributes: ["MessageId"],
        transaction,
        raw: true,
      });

      const existingIds = existingMessages.map((m) => m.MessageId);

      const messagesToCreate = messages
        .filter((m) => !existingIds.includes(m.id))
        .map((m) => ({
          campaign_id,
          MessageId: m.id,
          content: m.message,
          channel: "Email",
          status: "pending",
          attempts: 0,
          last_attempt_at: null,
          max_retries: campaign.max_retries,
        }));

      if (!messagesToCreate.length) {
        throw new Error("All selected messages are already linked");
      }

      /* ===============================
         4. Crear mensajes
      =============================== */
      await CampaignMessage.bulkCreate(messagesToCreate, {
        transaction,
        individualHooks: true, // 👈 importante
      });

      return {
        added: messagesToCreate.length,
        skipped: existingIds.length,
      };
    });
  }

  async deleteMessagesFromCampaign(data, userId) {
    const sequelize = await initSequelize();
    const { Campaign, CampaignMessage } = sequelize.models;

    const { campaign_id, message_ids } = data;

    return sequelize.transaction(async (transaction) => {
      const campaign = await Campaign.findOne({
        where: {
          id: campaign_id,
          UserId: userId,
        },
        transaction,
      });

      if (!campaign) {
        throw new Error("Campaign not found or not authorized");
      }

      const messages = await CampaignMessage.findAll({
        where: {
          id: message_ids,
          campaign_id,
        },
        transaction,
      });

      if (!messages.length) {
        throw new Error("No messages found to delete");
      }

      // 🔥 Hooks se ejecutan aquí
      for (const message of messages) {
        await message.destroy({ transaction });
      }

      return {
        deleted: messages.length,
      };
    });
  }
  async getFailedCampaignMessages(userId) {
    const sequelize = await initSequelize();
    const {
      Campaign,
      CampaignMessage,
      CampaignRecipient,
      Contact,
      MessageLog,
    } = sequelize.models;

    const results = await MessageLog.findAll({
      where: {
        status: "failed",
      },
      attributes: [
        "error_message",
        "created_at",
        "CampaignMessageId",
        "CampaignRecipientId",
      ],
      include: [
        {
          model: CampaignMessage,
          attributes: ["id", "content", "attempts"],
          include: [
            {
              model: Campaign,
              where: { UserId: userId },
              attributes: ["id", "name", "status"],
            },
          ],
        },
        {
          model: CampaignRecipient,
          attributes: ["ContactId"],
          include: [
            {
              model: Contact,
              attributes: ["id", "email"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      raw: true,
    });

    return results.map((r) => ({
      campaignId: r["CampaignMessage.Campaign.id"],
      campaignName: r["CampaignMessage.Campaign.name"],
      campaignStatus: r["CampaignMessage.Campaign.status"],

      messageId: r["CampaignMessage.id"],
      messageContent: r["CampaignMessage.content"],

      contactId: r["CampaignRecipient.Contact.id"],
      contactEmail: r["CampaignRecipient.Contact.email"],

      errorMessage: r.error_message,
      attempts: r["CampaignMessage.attempts"],
      failedAt: r.created_at,
    }));
  }
}

module.exports = { CampaignsMessages };
