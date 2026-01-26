require("dotenv").config();
const { initSequelize } = require("../libs/sequelize");
const { fn, literal, col, Op } = require("sequelize");
const dayjs = require("dayjs");

class Campaign {
  async _getModels() {
    const sequelize = await initSequelize();
    return sequelize.models;
  }

  async _getSequielizeInstace() {
    const sequelize = await initSequelize();
    return sequelize;
  }

  async getCamapignId(campaign_id, userId) {
    const { Campaign } = await this._getModels();
    const rta = await Campaign.findOne({
      where: {
        id: campaign_id,
        UserId: userId,
      },
    });
    return rta;
  }

  async findTopCampaignsByMessagesSended(userId) {
    const { CampaignMessage, Campaign } = await this._getModels();
    const rta = await CampaignMessage.findAll({
      attributes: [[fn("COUNT", col("CampaignMessage.id")), "messagesSent"]],
      include: [
        {
          model: Campaign,
          where: {
            UserId: userId,
            status: "completed",
          },
          attributes: ["name"], // deja que Sequelize maneje el alias o usa raw
        },
      ],
      group: ["Campaign.id"],
      order: [[literal("messagesSent"), "DESC"]],
      limit: 5,
      raw: true, // Opcional, para aplanar la respuesta
    });

    return rta;
  }

  async getSuccessErrorRateByCampaign(userId) {
    try {
      const sequelize = await this._getSequielizeInstace();
      const results = await sequelize.query(`
        SELECT
        c.name,
        SUM(CASE WHEN cm.status = 'sent' THEN 1 ELSE 0 END) AS totalSuccess,
        SUM(CASE WHEN cm.status = 'failed' THEN 1 ELSE 0 END) AS totalErrors,
        COUNT(*) AS totalSent
        FROM campaign_messages cm join campaigns c 
        on c.id =cm.campaign_id
        WHERE c.UserId =${userId} and c.status='completed'
        group by c.name;`);
      return results[0];
    } catch (error) {
      console.error("Error al calcular la tasa de éxito:", error);
      throw new Error("No se pudo calcular la tasa de éxito de la campaña");
    }
  }

  async getCampaignsAboutToSent(userId) {
    const { Campaign, CampaignRecipient, Contact } = await this._getModels();
    const rta = await Campaign.findAll({
      where: { UserId: userId, status: { [Op.or]: ["pending"] } },
      attributes: ["start_date", "name", "end_date", "status"],
      include: [
        {
          model: CampaignRecipient,
          attributes: ["ContactId"],
          include: [{ model: Contact, attributes: ["name", "email"] }],
        },
      ],
      order: [["start_date", "DESC"]],
    });
    return rta;
  }

  async create(data) {
    const { Campaign, CampaignRecipient, Message, CampaignMessage } =
      await this._getModels();
    const rta = await Campaign.create(data);
    if (data?.recipients) {
      const { recipients, status } = data;
      const newRecipients = recipients?.map((contact) => ({
        status: status,
        campaign_id: rta?.id,
        ContactId: contact?.key,
      }));
      await CampaignRecipient.bulkCreate(newRecipients, {
        hooks: false,
      });
    }
    if (data?.messages) {
      const campaingMessages = await Message.findAll({
        where: {
          id: { [Op.in]: [data?.messages] },
        },
        attributes: [
          ["id", "MessageId"],
          ["message", "content"],
        ],
        raw: true,
      });

      const messagesToadd = campaingMessages?.map((cm) => ({
        MessageId: cm.MessageId,
        content: cm.content,
        campaign_id: rta?.id,
        channel: "Email",
        max_retries: data?.max_retries,
      }));

      const addMessagesToCampaign =
        await CampaignMessage.bulkCreate(messagesToadd);
    }
    return { ...rta?.dataValues, contacts: data?.recipients?.length };
  }

  async updateCampaign(data) {
    const { Campaign } = await this._getModels();
    const campaign = await Campaign.findByPk(data.id);
    if (!campaign) throw new Error("Campaign not found");

    await campaign.update(data); // 🔥 AQUÍ sí dispara afterUpdate

    return campaign;
  }

  async getCampaingsAndRecipients(userId) {
    const { Campaign, CampaignRecipient, Contact } = await this._getModels();
    const rta = await Campaign.findAll({
      where: { UserId: userId },

      attributes: {
        exclude: ["created_at", "updated_at", "deletedAt", "UserId"],
      },
      include: [
        {
          model: CampaignRecipient,
          attributes: [[fn("COUNT", col("ContactId")), "contacts"]],
          include: [
            {
              model: Contact,
              attributes: [],
            },
          ],
        },
      ],
      group: [[literal("id"), "DESC"]],
      raw: true,
    });

    for (const column of rta) {
      for (const key in column) {
        if (key.includes(".")) {
          const columnSplitted = key.split(".")[1];
          column[columnSplitted] = column[key];
        }
      }
    }

    return rta;
  }

  async getSelectedRecipientsByCampaign(campaign_id, userId) {
    const { Contact, CampaignRecipient } = await this._getModels();
    const rta = await Contact.findAll({
      where: { UserId: userId },
      attributes: ["name", "email", "id"],
      include: [
        {
          model: CampaignRecipient,
          where: { campaign_id: campaign_id },
          attributes: [],
        },
      ],
      raw: true,
    });
    return rta?.map((c) => ({
      label: c.email,
      value: c.id,
      key: c.id,
    }));
  }

  async getCampaignStatsByUser(userId) {
    const sequelize = await initSequelize();
    const { Campaign, CampaignRecipient, CampaignMessage } = sequelize.models;

    const todayStart = dayjs().startOf("day").toDate();
    const todayEnd = dayjs().endOf("day").toDate();

    /* ===============================
       Total de campañas
    =============================== */
    const total = await Campaign.count({
      where: { UserId: userId },
    });

    /* ===============================
       Campañas activas
    =============================== */
    const active = await Campaign.count({
      where: {
        UserId: userId,
        status: "active",
      },
    });

    /* ===============================
       Campañas programadas hoy
       (pending o active)
    =============================== */
    const scheduledToday = await Campaign.count({
      where: {
        UserId: userId,
        status: {
          [Op.in]: ["pending", "active"],
        },
        start_date: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });

    /* ===============================
       Total de destinatarios
       (todas las campañas del usuario)
    =============================== */
    const recipientsResult = await CampaignRecipient.findAll({
      attributes: [
        [
          fn("COUNT", fn("DISTINCT", col("CampaignRecipient.ContactId"))),
          "total",
        ],
      ],
      include: [
        {
          model: Campaign,
          attributes: [],
          where: { UserId: userId },
          include: [
            {
              model: CampaignMessage,
              attributes: [],
              where: {
                status: "sent",
              },
              required: true, // 🔥 clave
            },
          ],
        },
      ],
      raw: true,
    });

    const totalRecipients = Number(recipientsResult?.[0]?.total || 0);

    return {
      total,
      active,
      scheduledToday,
      totalRecipients,
    };
  }

  async getCamapignsDetails(userId) {
    const sequelize = await initSequelize();
    const { Campaign } = sequelize.models;
    const rta = await Campaign.findAll({
      where: {
        userId: userId,
      },
      attributes: ["id", "name", "category", "status"],
    });
    return rta;
  }

  async simulateCampaign(campaignId, userId) {
    const sequelize = await initSequelize();
    const { Campaign, CampaignMessage, CampaignRecipient } = sequelize.models;

    /* ===============================
       1️⃣ Obtener campaña
    =============================== */
    const campaign = await Campaign.findOne({
      where: {
        id: campaignId,
        UserId: userId,
      },
      raw: true,
    });

    if (!campaign) {
      return {
        campaign: null,
        stats: {},
        warnings: [],
        errors: ["The campaign does not exist or does not belong to the user."],
      };
    }

    const errors = [];
    const warnings = [];

    /* ===============================
       2️⃣ Validaciones base
    =============================== */
    if (campaign.status === "active") {
      errors.push("The campaign is now active");
    }

    if (!campaign.start_date || !campaign.end_date) {
      errors.push("The campaign has no defined date range");
    }

    /* ===============================
       3️⃣ Mensajes
    =============================== */
    const messages = await CampaignMessage.findAll({
      where: { campaign_id: campaign.id },
      attributes: ["channel", "content"],
      raw: true,
    });

    if (messages.length === 0) {
      errors.push("The campaign has no associated messages.");
    }

    /* ===============================
       4️⃣ Destinatarios
    =============================== */
    const recipients = await CampaignRecipient.findAll({
      where: { campaign_id: campaign.id },
      raw: true,
    });

    if (recipients.length === 0) {
      errors.push("The campaign has no target audience.");
    }

    /* ===============================
       5️⃣ Métricas
    =============================== */
    const totalRecipients = recipients.length;
    const totalMessages = messages.length;
    const totalDeliveries = totalRecipients * totalMessages;

    /* ===============================
       6️⃣ Duración estimada
    =============================== */
    let estimatedDurationMinutes = 0;

    switch (campaign.send_strategy) {
      case "ONCE":
        estimatedDurationMinutes = Math.ceil(
          totalDeliveries / process.env.MAIL_SEND_PER_DAY_LIMIT || 30,
        );
        break;

      case "INTERVAL":
        estimatedDurationMinutes =
          totalMessages * (campaign.send_interval_value || 1);
        break;

      case "DAILY":
        estimatedDurationMinutes = totalMessages * 1440;
        warnings.push(
          "The DAILY strategy can extend the duration of the campaign",
        );
        break;

      default:
        warnings.push("Unrecognized shipping strategy");
        break;
    }

    /* ===============================
       7️⃣ Warnings adicionales
    =============================== */
    if (totalDeliveries > 1000) {
      warnings.push("The campaign has a high volume of shipments");
    }

    if (campaign.max_retries > 5) {
      warnings.push("High number of retries");
    }

    /* ===============================
     8️⃣ Timeline (🆕)
  =============================== */
    const timeline = [];

    const startAt = dayjs(campaign.start_date || new Date());

    timeline.push({
      type: "start",
      label: "Campaign starts",
      at: startAt.toISOString(),
    });

    timeline.push({
      type: "send",
      label: "Sending messages to recipients",
      at: startAt.add(1, "minute").toISOString(),
    });

    if (campaign.max_retries > 0) {
      for (let i = 1; i <= campaign.max_retries; i++) {
        timeline.push({
          type: "retry",
          label: `Retry attempt #${i}`,
          at: startAt
            .add(1 + i * (campaign.retry_delay_minutes || 5), "minute")
            .toISOString(),
        });
      }
    }

    timeline.push({
      type: "end",
      label: "Campaign completed",
      at: startAt.add(estimatedDurationMinutes, "minute").toISOString(),
    });

    /* ===============================
       8️⃣ Resultado final
    =============================== */
    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        category: campaign.category,
        status: campaign.status,
        send_strategy: campaign.send_strategy,
        send_interval_value: campaign.send_interval_value,
        send_interval_unit: campaign.send_interval_unit,
        max_retries: campaign.max_retries,
      },

      stats: {
        recipients: totalRecipients,
        messages: totalMessages,
        totalDeliveries,
        estimatedDurationMinutes,
      },
      messages: messages,
      timeline,
      warnings,
      errors,
    };
  }
}

module.exports = { Campaign };
