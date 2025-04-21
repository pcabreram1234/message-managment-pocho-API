"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("campaign_recipients", [
      {
        campaign_id: 1,
        contact_id: 101,
        status: "pending",
        last_attempt_at: null,
        error_message: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        campaign_id: 2,
        contact_id: 102,
        status: "sent",
        last_attempt_at: new Date(),
        error_message: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("campaign_recipients", null, {});
  },
};
