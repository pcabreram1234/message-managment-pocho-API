const { initContactHooks } = require("./Contact");

const initBDHooks = () => {
  initContactHooks();
};

module.exports = { initBDHooks };
