"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("campaign_messages", [
      {
        campaign_id: 1,
        content: "¡Bienvenido a nuestro servicio!",
        send_time: new Date(),
        channel: "SMS",
        delay_type: "fixed",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        campaign_id: 2,
        content: "¡Obtén 20% de descuento en tu próxima compra!",
        send_time: new Date(new Date().setDate(new Date().getDate() + 1)),
        channel: "WhatsApp",
        delay_type: "relative",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("campaign_messages", null, {});
  },
};
