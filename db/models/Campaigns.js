const { Model, DataTypes, Sequelize } = require("sequelize");
const CAMPAIGN_TABLE = "campaigns";

const CampaignModel = {
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM(
      "pending",
      "active",
      "paused",
      "completed",
      "cancelled",
    ),
    defaultValue: "pending",
  },
  category: DataTypes.STRING,
  start_date: DataTypes.DATE,
  end_date: DataTypes.DATE,
  send_strategy: {
    type: DataTypes.ENUM(
      "ONCE", // una sola vez dentro de la vigencia
      "DAILY", // una vez por día
      "INTERVAL", // cada N horas/días
      "CUSTOM", // reglas avanzadas (futuro)
    ),
    allowNull: false,
    defaultValue: "ONCE",
  },
  send_interval_value: {
    type: DataTypes.INTEGER,
    allowNull: true, // ej: 1, 2, 3
  },
  send_interval_unit: {
    type: DataTypes.ENUM("HOUR", "DAY"),
    allowNull: true,
  },
  max_retries: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  retry_delay_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
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
    onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
  },
};

class Campaign extends Model {
  static associate(models) {
    this.belongsTo(models.User);
    this.hasMany(models.CampaignMessage, { foreignKey: "campaign_id" });
    this.hasMany(models.CampaignRecipient, { foreignKey: "campaign_id" });
    this.hasMany(models.MessageLog, { foreignKey: "campaign_id" });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: CAMPAIGN_TABLE,
      modelName: "Campaign",
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = { CampaignModel, CAMPAIGN_TABLE, Campaign };
