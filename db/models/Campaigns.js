const { Model, DataTypes } = require("sequelize");
const CAMPAIGN_TABLE = "campaigns";

const CampaignModel = {
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  status: DataTypes.ENUM(
    "pending",
    "active",
    "paused",
    "completed",
    "cancelled"
  ),
  start_date: DataTypes.DATE,
  end_date: DataTypes.DATE,
};

class Campaign extends Model {
  static associate(models) {
    this.belongsTo(models.User  );
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
