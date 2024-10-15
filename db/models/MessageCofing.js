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
    type: DataTypes.JSON,
  },
  recipient: {
    allowNull: true,
    defaultValue: [],
    type: Sequelize.TEXT,
  },
  scheduled_date: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: Sequelize.fn("NOW"),
  },
  status: {
    allowNull: false,
    type: DataTypes.ENUM("sended", "pending", "error"),
    defaultValue: "pending",
    get() {
      // Returning the first Char to Upper and the remaing in lowerCase
      const rawValue = this.getDataValue("status");
      const startChar = rawValue.charAt(0).toUpperCase();
      const remaingChars = rawValue.slice(1);
      return `${startChar}${remaingChars}`;
    },
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: "created_at",
    defaultValue: Sequelize.fn("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: "updated_at",
    defaultValue: Sequelize.fn("NOW"),
    onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
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
      paranoid: true,
    };
  }
}

module.exports = { MESSAGE_CONFIG_TABLE, MessageConfigModel, MessageConfig };
