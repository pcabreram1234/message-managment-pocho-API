"use strict";
const {
  categories,
  contacts,
  messages,
  users,
} = require("../data/MandatoryData");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", users);
    await queryInterface.bulkInsert("categories", categories);
    await queryInterface.bulkInsert("contacts", contacts);
    await queryInterface.bulkInsert("messages", messages);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.delete("users");
    await queryInterface.delete("categories");
    await queryInterface.delete("contacts");
    await queryInterface.delete("messages");
  },
};
