const { Model, DataTypes, Sequelize } = require("sequelize");

const MESSAGE_CONFIG_TABLE = "messages_config";

const MessageConfigModel = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  message_id: {
    allowNull: false,
    index: true,
    type: DataTypes.INTEGER,
  },
  message: {
    type: DataTypes.TEXT,
  },
  categories: {
    allowNull: true,
    type: Sequelize.JSON,
  },
  send_to: {
    allowNull: true,
    defaultValue: [],
    type: Sequelize.JSON,
  },
  send_on_date: {
    allowNull: false,
    type: "datetime",
    defaultValue: Sequelize.fn("NOW"),
  },
  message_status: {
    allowNull: false,
    type: DataTypes.ENUM("sended", "pending", "error"),
    defaultValue: "pending",
    get() {
      // Returning the first Char to Upper and the remaing in lowerCase
      const rawValue = this.getDataValue("message_status");
      const startChar = rawValue.charAt(0).toUpperCase();
      const remaingChars = rawValue.slice(1);
      return `${startChar}${remaingChars}`;
    },
  },
  createdAt: {
    allowNull: false,
    type: "timestamp",
    field: "created_at",
    defaultValue: Sequelize.fn("NOW"),
  },
  updatedAt: {
    allowNull: false,
    type: "timestamp",
    field: "updated_at",
    defaultValue: Sequelize.fn("NOW"),
    onUpdate: Sequelize.literal("CURRENT_TIMESTAMP()"),
  },
};

class MessageConfig extends Model {
  static associate(models) {
    this.belongsTo(models.User);
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: MESSAGE_CONFIG_TABLE,
      modelName: "MessageConfig",
      timestamps: true,
    };
  }
}

module.exports = { MESSAGE_CONFIG_TABLE, MessageConfigModel, MessageConfig };
