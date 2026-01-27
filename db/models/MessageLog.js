const { Model, DataTypes, Sequelize } = require("sequelize");
const MESSAGE_LOG_TABLE = "message_logs";

const MessageLogModel = {
  campaign_id: DataTypes.INTEGER,
  CampaignMessageId: DataTypes.INTEGER,
  sent_at: DataTypes.DATE,
  status: DataTypes.ENUM("success", "failed", "retrying"),
  attempts: DataTypes.INTEGER,
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

class MessageLog extends Model {
  static associate(models) {
    this.belongsTo(models.Campaign, { foreignKey: "campaign_id" });
    this.belongsTo(models.CampaignMessage, { foreignKey: "CampaignMessageId" });
    this.belongsTo(models.CampaignRecipient, {
      foreignKey: "CampaignRecipientId",
    });
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
