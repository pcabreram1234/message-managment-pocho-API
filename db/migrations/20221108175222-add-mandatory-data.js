"use strict";

const { CATEGORY_TABLE, Category } = require("../models/Categories");
const { CONTACTS_TABLE } = require("../models/Contacts");
const { MESSAGE_TABLE } = require("../models/Messages");
const { MESSAGE_CONFIG_TABLE } = require("../models/MessageCofing");
const { USER_TABLE } = require("../models/Users");
const {
  categories,
  contacts,
  messages,
  users,
} = require("../data/MandatoryData");
const { Op, DataTypes } = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(USER_TABLE, users);
    await queryInterface.bulkInsert(CATEGORY_TABLE, categories);
    await queryInterface.bulkInsert(MESSAGE_TABLE, messages);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(CATEGORY_TABLE, {
      id: { [Op.gt]: [1] },
    });

    await queryInterface.bulkDelete(MESSAGE_TABLE, {
      id: { [Op.gt]: [1] },
    });

    await queryInterface.bulkDelete(USER_TABLE, {
      id: { [Op.gt]: [1] },
    });
  },
};
