const { Model, DataTypes, Sequelize } = require("sequelize");
const CONTACTS_TABLE = "contacts";

const ContactModel = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING,
    length: 50,
  },
  email: {
    allowNull: false,
    type: DataTypes.STRING,
    length: 50,
  },
  phone_number: {
    allowNull: true,
    type: DataTypes.CHAR,
  },
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
    onUpdate: Sequelize.literal("CURRENT_TIMESTAMP()"),
  },
};

class Contact extends Model {
  static associate(models) {
    this.belongsTo(models.User);
    this.belongsToMany(models.User, {
      through: { model: "users_contacts" },
    });
    this.belongsToMany(models.Message, {
      through: { model: "messages_contacts" },
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CONTACTS_TABLE,
      modelName: "Contact",
      timestamps: true,
      charset: "utf8",
      collate: "utf8_general_ci",
      paranoid: true,
    };
  }
}

module.exports = { CONTACTS_TABLE, ContactModel, Contact };
