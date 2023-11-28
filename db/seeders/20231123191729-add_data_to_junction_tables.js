"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert("messages_categories", [
      {
        CategoryId: 1,
        MessageId: 1,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        CategoryId: 2,
        MessageId: 2,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        CategoryId: 3,
        MessageId: 3,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        CategoryId: 4,
        MessageId: 4,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        CategoryId: 1,
        MessageId: 2,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("messages_categories", null, {});
  },
};
