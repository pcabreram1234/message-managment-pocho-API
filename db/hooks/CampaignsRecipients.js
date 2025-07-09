const { CampaignRecipient } = require("../models/CampaignRecipients");

const initCampaignRecipientHooks = async () => {
  CampaignRecipient.addHook("beforeCreate", async (data, options) => {
    console.log(data);
    const { recipients, status, campaign_id } = data;
    // console.log(recipients);
    const recipientsToInsert = recipients?.map((data) => ({
      campaign_id: campaign_id,
      status: status,
      ContactdId: data?.key,
    }));
    return recipientsToInsert;
  });
};

module.exports = { initCampaignRecipientHooks };
