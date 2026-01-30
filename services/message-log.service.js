const { initSequelize } = require("../libs/sequelize");

class MessageLogService {
  async getMessagesByContact(contactId, userId) {
    const sequelize = await initSequelize();
    const { MessageLog, Campaign, CampaignRecipient, Contact } =
      sequelize.models;

    if (!contactId) {
      throw new Error("ContactId is required");
    }

    const logs = await MessageLog.findAll({
      attributes: [
        "id",
        "status",
        "attempts",
        "error_message",
        "sent_at",
        "createdAt",
      ],
      include: [
        {
          model: CampaignRecipient,
          required: true,
          attributes: [],
          include: [
            {
              model: Contact,
              required: true,
              attributes: ["id", "email", "name"],
              where: {
                id: contactId,
                UserId: userId, // 🔐 multi-tenant
              },
            },
          ],
        },
        {
          model: Campaign,
          required: false,
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
      nest: true,
    });

    /* ===============================
       Normalización de salida
    =============================== */
    return logs.map((log) => ({
      id: log.id,
      status: log.status,
      attempts: log.attempts,
      error_message: log.error_message,
      sent_at: log.sent_at || log.createdAt,
      campaign_name: log.Campaign?.name || null,
    }));
  }
}

module.exports = { MessageLogService };
