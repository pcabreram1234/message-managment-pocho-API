const { initContactHooks } = require("./Contact");
const { initCategoryHooks } = require("./Category");
const { initMessageConfigHooks } = require("./MessageConfig");
// const { initCampaignRecipientHooks } = require("./CampaignsRecipients");
const { initCampaignHooks } = require("./Campaings");
const { initCampaignMessageHooks } = require("./CampaignMessages");
const initBDHooks = () => {
  initContactHooks();
  initCategoryHooks();
  initMessageConfigHooks();
  initCampaignHooks();
  initCampaignMessageHooks();
  // initCampaignRecipientHooks();
};

module.exports = { initBDHooks };
