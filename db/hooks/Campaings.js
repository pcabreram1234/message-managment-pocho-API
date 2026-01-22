const { Campaign } = require("../models/Campaigns");
const { CampaignMessage } = require("../models/CampaignMessages");

const initCampaignHooks = async () => {
  Campaign.addHook("afterUpdate", async (campaign, options) => {
    const fieldsToSync = [
      "send_strategy",
      "send_interval_value",
      "send_interval_unit",
      "max_retries",
      "retry_delay_minutes",
    ];

    const hasRelevantChanges = fieldsToSync.some((field) =>
      campaign.changed(field),
    );

    if (!hasRelevantChanges) return;

    await CampaignMessage.update(
      {
        send_strategy: campaign.send_strategy,
        send_interval_value: campaign.send_interval_value,
        send_interval_unit: campaign.send_interval_unit,
        max_retries: campaign.max_retries,
        retry_delay_minutes: campaign.retry_delay_minutes,
      },
      {
        where: { campaign_id: campaign.id },
        transaction: options.transaction,
      },
    );
  });
};

module.exports = { initCampaignHooks };
