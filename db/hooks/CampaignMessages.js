const { CampaignMessage } = require("../models/CampaignMessages");
const { Campaign } = require("../models/Campaigns");

const initCampaignMessageHooks = () => {
  CampaignMessage.addHook("beforeCreate", async (cm, options) => {
    const campaign = await Campaign.findByPk(cm.campaign_id, {
      transaction: options.transaction,
    });

    if (!campaign) {
      throw new Error("Campaign does not exist");
    }

    if (!["pending", "paused"].includes(campaign.status)) {
      throw new Error(
        `Cannot add messages to a campaign with status '${campaign.status}'`,
      );
    }
  });

  CampaignMessage.addHook("beforeDestroy", async (campaignMessage, options) => {
    const campaign = await Campaign.findByPk(campaignMessage.campaign_id, {
      transaction: options.transaction,
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.status !== "pending") {
      throw new Error(
        "Messages cannot be removed from a campaign that is already active or completed",
      );
    }

    if (["sending", "sent"].includes(campaignMessage.status)) {
      throw new Error(
        "Messages that are already sent or in progress cannot be deleted",
      );
    }
  });
};

module.exports = { initCampaignMessageHooks };
