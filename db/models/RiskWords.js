// models/riskWord.model.js
const { Model, DataTypes, Sequelize } = require("sequelize");

const RISK_WORD_TABLE = "risk_words";

const RiskWordModel = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  word: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
    set(value) {
      // Guardamos siempre en mayúsculas para facilitar la comparación
      this.setDataValue("word", value.toUpperCase().trim());
    },
  },
  isActive: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdAt: {
    allowNull: false,
    type: "timestamp",
    field: "created_at",
    defaultValue: Sequelize.fn("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    allowNull: false,
    type: "timestamp",
    field: "updated_at",
    defaultValue: Sequelize.fn("NOW"),
    onUpdate: Sequelize.literal("CURRENT_TIMESTAMP()"),
  },
};

class RiskWord extends Model {
  static associate(models) {
    // No requiere asociaciones iniciales
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: RISK_WORD_TABLE,
      modelName: "RiskWord",
      timestamps: true,
    };
  }
}

module.exports = { RISK_WORD_TABLE, RiskWordModel, RiskWord };
