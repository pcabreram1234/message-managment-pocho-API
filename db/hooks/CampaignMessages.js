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
};

module.exports = { initCampaignMessageHooks };
