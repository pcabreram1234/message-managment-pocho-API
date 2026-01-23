const { initSequelize } = require("../libs/sequelize");
const { fn, col } = require("sequelize");

class CampaignDuplicateService {
  async duplicateCampaign(campaignId, userId) {
    const sequelize = await initSequelize();
    const { Campaign, CampaignMessage, CampaignRecipient } = sequelize.models;

    return sequelize.transaction(async (transaction) => {
      /* ===============================
         1. Obtener campaña original
      =============================== */
      const originalCampaign = await Campaign.findOne({
        where: { id: campaignId, UserId: userId },
        transaction,
      });

      if (!originalCampaign) {
        throw new Error("Campaign not found or not authorized");
      }

      /* ===============================
         2. Clonar campaña
      =============================== */
      const clonedCampaign = await Campaign.create(
        {
          name: `Copy of ${originalCampaign.name}`,
          description: originalCampaign.description,
          category: originalCampaign.category,

          send_strategy: originalCampaign.send_strategy,
          send_interval_value: originalCampaign.send_interval_value,
          send_interval_unit: originalCampaign.send_interval_unit,
          max_retries: originalCampaign.max_retries,
          retry_delay_minutes: originalCampaign.retry_delay_minutes,

          start_date: originalCampaign.start_date,
          end_date: originalCampaign.end_date,

          status: "pending", // 🔥 siempre reset
          UserId: userId,
        },
        { transaction },
      );

      /* ===============================
         3. Duplicar mensajes
      =============================== */
      const messages = await CampaignMessage.findAll({
        where: { campaign_id: originalCampaign.id },
        transaction,
        raw: true,
      });

      if (messages.length > 0) {
        const duplicatedMessages = messages.map((m) => ({
          campaign_id: clonedCampaign.id,
          MessageId: m.MessageId,
          content: m.content,
          channel: m.channel,

          status: "pending",
          attempts: 0,
          last_attempt_at: null,
          error_message: null,

          send_strategy: clonedCampaign.send_strategy,
          send_interval_value: clonedCampaign.send_interval_value,
          send_interval_unit: clonedCampaign.send_interval_unit,
          max_retries: clonedCampaign.max_retries,
          retry_delay_minutes: clonedCampaign.retry_delay_minutes,
        }));

        await CampaignMessage.bulkCreate(duplicatedMessages, {
          transaction,
        });
      }

      /* ===============================
         4. Duplicar destinatarios
      =============================== */
      const recipients = await CampaignRecipient.findAll({
        where: { campaign_id: originalCampaign.id },
        transaction,
        raw: true,
      });

      if (recipients.length > 0) {
        const duplicatedRecipients = recipients.map((r) => ({
          campaign_id: clonedCampaign.id,
          ContactId: r.ContactId,

          status: "pending",
          last_attempt_at: null,
          error_message: null,
        }));

        await CampaignRecipient.bulkCreate(duplicatedRecipients, {
          transaction,
        });
      }

      return await this.getCampaignWithRecipients(
        sequelize,
        clonedCampaign?.id,
        userId,
        transaction,
      );
    });
  }

  async getCampaignWithRecipients(sequelize, campaignId, userId, transaction) {
    const { Campaign, CampaignRecipient, Contact } = sequelize.models;

    const result = await Campaign.findOne({
      where: {
        id: campaignId,
        UserId: userId,
      },
      attributes: {
        exclude: ["created_at", "updated_at", "deletedAt", "UserId"],
      },
      include: [
        {
          model: CampaignRecipient,
          attributes: [[fn("COUNT", col("ContactId")), "contacts"]],
          include: [{ model: Contact, attributes: [] }],
        },
      ],
      group: ["Campaign.id"],
      raw: true,
      transaction,
    });

    // 🔄 Normalizar resultado (igual que tu servicio actual)
    for (const key in result) {
      if (key.includes(".")) {
        const cleanKey = key.split(".")[1];
        result[cleanKey] = result[key];
      }
    }

    return result;
  }
}

module.exports = { CampaignDuplicateService };
