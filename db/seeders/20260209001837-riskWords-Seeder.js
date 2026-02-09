"use strict";
const { RISK_WORD_TABLE } = require("../models/RiskWords");

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

    const riskWords = [
      { word: "FREE", isActive: true, created_at: new Date() },
      { word: "WIN", isActive: true, created_at: new Date() },
      { word: "CLICK HERE", isActive: true, created_at: new Date() },
      { word: "URGENT", isActive: true, created_at: new Date() },
      { word: "CASH", isActive: true, created_at: new Date() },
      { word: "GIFT", isActive: true, created_at: new Date() },
      { word: "PROMO", isActive: true, created_at: new Date() },
      { word: "OFFER", isActive: true, created_at: new Date() },
      { word: "GRATIS", isActive: true, created_at: new Date() },
      { word: "PREMIO", isActive: true, created_at: new Date() },
    ];

    await queryInterface.bulkInsert(RISK_WORD_TABLE, riskWords, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete(RISK_WORD_TABLE, null, {});
  },
};
