"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("message_logs", [
      {
        campaign_id: 1,
        contact_id: 101,
        message_id: 1,
        sent_at: new Date(),
        status: "success",
        attempts: 1,
        error_message: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        campaign_id: 2,
        contact_id: 102,
        message_id: 2,
        sent_at: new Date(),
        status: "failed",
        attempts: 2,
        error_message: "Timeout al enviar mensaje",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("message_logs", null, {});
  },
};
