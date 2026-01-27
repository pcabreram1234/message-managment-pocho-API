const { Model, DataTypes, Sequelize } = require("sequelize");
const CAMPAIGN_RECIPIENTS_TABLE = "campaign_recipients";

const CampaignRecipientModel = {
  campaign_id: DataTypes.INTEGER,
  status: DataTypes.ENUM(
    "pending",
    "active",
    "paused",
    "completed",
    "cancelled",
  ),
  last_attempt_at: DataTypes.DATE,
  error_message: DataTypes.STRING,
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

class CampaignRecipient extends Model {
  static associate(models) {
    this.belongsTo(models.Campaign, { foreignKey: "campaign_id" });
    this.belongsTo(models.Contact);
    this.hasMany(models.MessageLog, { foreignKey: "CampaignRecipientId" });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: CAMPAIGN_RECIPIENTS_TABLE,
      modelName: "CampaignRecipient",
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = {
  CAMPAIGN_RECIPIENTS_TABLE,
  CampaignRecipientModel,
  CampaignRecipient,
};
