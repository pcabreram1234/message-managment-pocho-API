const { Op } = require("sequelize");
const { initSequelize } = require("../libs/sequelize");

const validateCampaignLaunch = async (req, res, next) => {
  try {
    const data = req?.body?.data;
    const { campaignId } = data;
    const userId = req.user?.id; // asumimos auth middleware previo
    

    if (!campaignId) {
      return res.status(400).json({ message: "Campaign ID is required" });
    }

    const sequelize = await initSequelize();
    const { Campaign, CampaignRecipient, CampaignMessage } = sequelize.models;

    const campaign = await Campaign.findOne({
      where: {
        id: campaignId,
        UserId: userId,
        status: { [Op.notIn]: ["active", "completed", "cancelled"] },
      },
    });

    if (!campaign) {
      return res.status(404).json({
        message:
          "Campaign not found, already launched, completed or not owned by user",
      });
    }

    const now = new Date();

    if (campaign.start_date && now < campaign.start_date) {
      return res.status(409).json({
        message: "Campaign has not started yet",
      });
    }

    if (campaign.end_date && now > campaign.end_date) {
      return res.status(409).json({
        message: "Campaign has already expired",
      });
    }

    const recipientsCount = await CampaignRecipient.count({
      where: { campaign_id: campaign.id },
    });

    if (recipientsCount === 0) {
      return res.status(409).json({
        message: "Campaign has no recipients",
      });
    }

    const messagesCount = await CampaignMessage.count({
      where: { campaign_id: campaign.id },
    });

    if (messagesCount === 0) {
      return res.status(409).json({
        message: "Campaign has no messages associated",
      });
    }

    // Validación de estrategia de envío
    if (campaign.send_strategy === "INTERVAL") {
      if (!campaign.send_interval_value || !campaign.send_interval_unit) {
        return res.status(422).json({
          message: "Invalid interval configuration for campaign",
        });
      }
    }

    if (campaign.send_strategy === "ONCE") {
      if (!campaign.start_date) {
        return res.status(422).json({
          message: "ONCE strategy requires start_date",
        });
      }
    }

    // Todo OK → inyectamos la campaña en req para reutilizar
    req.campaign = campaign;
    next();
  } catch (error) {
    console.error("validateCampaignLaunch error:", error);
    res.status(500).json({ message: "Internal validation error" });
  }
};

module.exports = { validateCampaignLaunch };
