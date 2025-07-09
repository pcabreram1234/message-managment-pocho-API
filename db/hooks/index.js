const { initContactHooks } = require("./Contact");
const { initCategoryHooks } = require("./Category");
const { initMessageConfigHooks } = require("./MessageConfig");
const { initCampaignRecipientHooks } = require("./CampaignsRecipients");

const initBDHooks = () => {
  initContactHooks();
  initCategoryHooks();
  initMessageConfigHooks();
  // initCampaignRecipientHooks();
};

module.exports = { initBDHooks };
