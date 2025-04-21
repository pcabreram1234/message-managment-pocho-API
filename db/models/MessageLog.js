const { Model, DataTypes } = require("sequelize");
const MESSAGE_LOG_TABLE = "message_logs";

const MessageLogModel = {
  campaign_id: DataTypes.INTEGER,
  contact_id: DataTypes.INTEGER,
  message_id: DataTypes.INTEGER,
  sent_at: DataTypes.DATE,
  status: DataTypes.ENUM("success", "failed", "retrying"),
  attempts: DataTypes.INTEGER,
  error_message: DataTypes.STRING,
};

class MessageLog extends Model {
  static associate(models) {
    this.belongsTo(models.Campaign, { foreignKey: "campaign_id" });
    this.belongsTo(models.CampaignMessage, { foreignKey: "message_id" });
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: MESSAGE_LOG_TABLE,
      modelName: "MessageLog",
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = { MESSAGE_LOG_TABLE, MessageLogModel, MessageLog };
