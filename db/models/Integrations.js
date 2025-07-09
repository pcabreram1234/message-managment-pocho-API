const { Model, DataTypes, Sequelize } = require("sequelize");
const INTEGRATIONS_TABLE = "integrations";

const IntegrationModel = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  type: {
    type: DataTypes.ENUM("whatsapp", "email", "sms"),
    allowNull: false,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  access_token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  client_id: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  client_secret: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  webhook_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sender_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  channel_config: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive", "error"),
    defaultValue: "active",
  },
  last_verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
};

class Integration extends Model {
  static associate(models) {
    this.belongsTo(models.User);
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: INTEGRATIONS_TABLE,
      modelName: "Integration",
      timestamps: true,
      paranoid: true,
    };
  }
}

module.exports = { Integration, IntegrationModel };
