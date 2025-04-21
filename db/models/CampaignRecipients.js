const { Model, DataTypes } = require("sequelize");
const CAMPAIGN_RECIPIENTS_TABLE = "campaign_recipients";

const CampaignRecipientModel = {
  campaign_id: DataTypes.INTEGER,
  status: DataTypes.ENUM("pending", "sending", "sent", "failed"),
  last_attempt_at: DataTypes.DATE,
  error_message: DataTypes.STRING,
};

class CampaignRecipient extends Model {
  static associate(models) {
    this.belongsTo(models.Campaign, { foreignKey: "campaign_id" });
    this.belongsTo(models.Contact)
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
