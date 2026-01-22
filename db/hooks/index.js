const { initContactHooks } = require("./Contact");
const { initCategoryHooks } = require("./Category");
const { initMessageConfigHooks } = require("./MessageConfig");
const { initCampaignRecipientHooks } = require("./CampaignsRecipients");
const { initCampaignHooks } = require("./Campaings");

const initBDHooks = () => {
  initContactHooks();
  initCategoryHooks();
  initMessageConfigHooks();
  initCampaignHooks();
  // initCampaignRecipientHooks();
};

module.exports = { initBDHooks };
