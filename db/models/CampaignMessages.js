const { Model, DataTypes, Sequelize } = require("sequelize");
const CAMPAIGN_MESSSAGES_TABLE = "campaign_messages";

const CampaignMessageModel = {
  campaign_id: DataTypes.INTEGER,
  content: DataTypes.TEXT,
  send_time: DataTypes.DATE,
  channel: DataTypes.ENUM("SMS", "WhatsApp", "Email"),
  delay_type: DataTypes.ENUM("fixed", "relative"),
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

class CampaignMessage extends Model {
  static associate(models) {
    this.belongsTo(models.Campaign, { foreignKey: "campaign_id" });
    this.hasMany(models.MessageLog, { foreignKey: "message_id" });
    this.belongsTo(models.Message);
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: CAMPAIGN_MESSSAGES_TABLE,
      modelName: "CampaignMessage",
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = {
  CampaignMessageModel,
  CampaignMessage,
  CAMPAIGN_MESSSAGES_TABLE,
};
