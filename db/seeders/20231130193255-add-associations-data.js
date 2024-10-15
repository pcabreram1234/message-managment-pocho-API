"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("messages_contacts", [
      {
        MessageId: 1,
        ContactId: 1,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        MessageId: 2,
        ContactId: 2,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        MessageId: 3,
        ContactId: 3,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        MessageId: 4,
        ContactId: 4,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        MessageId: 1,
        ContactId: 2,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        MessageId: 1,
        ContactId: 3,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        MessageId: 1,
        ContactId: 4,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
    ]);

    await queryInterface.bulkInsert("messages_categories", [
      {
        MessageId: 1,
        CategoryId: 1,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        MessageId: 2,
        CategoryId: 2,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        MessageId: 3,
        CategoryId: 3,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        MessageId: 4,
        CategoryId: 4,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        MessageId: 1,
        CategoryId: 2,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        MessageId: 1,
        CategoryId: 3,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        MessageId: 1,
        CategoryId: 4,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
    ]);

    await queryInterface.bulkInsert("users_contacts", [
      {
        UserId: 1,
        ContactId: 1,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        UserId: 1,
        ContactId: 2,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        UserId: 1,
        ContactId: 3,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      {
        UserId: 1,
        ContactId: 4,
        createdAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        updatedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("messages_contacts", null, {});
    await queryInterface.bulkDelete("messages_categories", null, {});
  },
};
