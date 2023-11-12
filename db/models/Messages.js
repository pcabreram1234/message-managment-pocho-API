const { array } = require("joi");
const { Model, DataTypes, Sequelize } = require("sequelize");
const MESSAGE_TABLE = "messages";

const MessageModel = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  message: {
    type: DataTypes.TEXT,
  },
  categories: {
    allowNull: true,
    type: DataTypes.JSON,
    unique: false,
    defaultValue: [],
  },
  associate_to: {
    allowNull: true,
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const rawValue = JSON.parse(this.getDataValue("associate_to"));
      return rawValue.length > 0 ? rawValue : [];
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

class Message extends Model {
  static associate(models) {
    this.belongsTo(models.User);
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: MESSAGE_TABLE,
      modelName: "Message",
      timestamps: true,
    };
  }
}

module.exports = { MESSAGE_TABLE, MessageModel, Message };
