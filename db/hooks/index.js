const { initContactHooks } = require("./Contact");
const { initCategoryHooks } = require("./Category");
const { initMessageConfigHooks } = require("./MessageConfig");

const initBDHooks = () => {
  initContactHooks();
  initCategoryHooks();
  initMessageConfigHooks();
};

module.exports = { initBDHooks };
