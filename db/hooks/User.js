const { Op } = require("sequelize");
const { User } = require("../models/Users");

const initContactHooks = async () => {
    User.addHook("beforeCreate", async (contact, options) => {
    const { dataValues } = contact;
    const { email } = dataValues;

    const existEmail = await User.findOne({
      where: {
        naemailme: email,
      },
    });

    if (existEmail !== null) {
      throw new Error("This email already exists");
    }
  });

};

module.exports = { initContactHooks };
