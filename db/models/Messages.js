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
    this.belongsToMany(models.Contact, { through: "messages_contacts" });
    this.belongsToMany(models.Category, {
      through: "messages_categories",
    });
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
