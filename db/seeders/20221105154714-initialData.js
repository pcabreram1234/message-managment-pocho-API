"use strict";
const { CATEGORY_TABLE } = require("../models/Categories");
const { CONTACTS_TABLE } = require("../models/Contacts");
const { MESSAGE_TABLE } = require("../models/Messages");
const { USER_TABLE } = require("../models/Users");

const { Op } = require("sequelize");

/* The second arguments of bulkInsert hast to be an array of records to insert */

const {
  categories,
  contacts,
  messages,
  users,
} = require("../data/MandatoryData");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    console.log(categories);
    await queryInterface.bulkInsert(CATEGORY_TABLE, categories).catch((err) => {
      console.log(err);
    });
    await queryInterface.bulkInsert(CONTACTS_TABLE, contacts);
    await queryInterface.bulkInsert(MESSAGE_TABLE, messages);
    await queryInterface.bulkInsert(USER_TABLE, users);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(CATEGORY_TABLE, {
      id: { [Op.gt]: [0] },
    });
    // await queryInterface.bulkDelete(CONTACTS_TABLE, {
    //   attribute: "id",
    //   value: [Op.gt] > 0,
    // });
    // await queryInterface.bulkDelete(MESSAGE_TABLE, {
    //   attribute: "id",
    //   value: [Op.gt] > 0,
    // });
    // await queryInterface.bulkDelete(USER_TABLE, {
    //   attribute: "id",
    //   value: [Op.gt] > 0,
    // });
  },
};
