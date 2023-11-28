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

    await queryInterface
      .bulkInsert("messages_contacts", [
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
      ])
      .then((resp) => {
        console.log(resp);
      });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("messages_contacts", null, {});
  },
};
