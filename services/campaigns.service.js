// const sequelize = require("../libs/sequelize");
const { initSequelize } = require("../libs/sequelize");
const { fn, literal, col, Op } = require("sequelize");

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
}

module.exports = { Campaign };
