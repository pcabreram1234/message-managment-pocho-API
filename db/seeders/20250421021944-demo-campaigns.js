"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("campaigns", [
      {
        name: "Campaña de Bienvenida",
        description: "Mensaje inicial para nuevos usuarios",
        status: "active",
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        UserId: 1,  
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Campaña Promocional",
        description: "Promoción para clientes frecuentes",
        status: "pending",
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        UserId: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("campaigns", null, {});
  },
};
