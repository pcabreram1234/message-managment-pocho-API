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
    unique: true,
  },
  phone_number: {
    allowNull: true,
    type: DataTypes.CHAR,
    unique: true,
  },
  categories: {
    allowNull: true,
    type: Sequelize.JSON,
    defaultValue: [],
    get() {
      const rawValue = JSON.parse(this.getDataValue("categories"));
      return rawValue.length > 0 ? rawValue : [];
    },
  },
  createdAt: {
    allowNull: false,
    type: "timestamp",
    field: "created_at",
    defaultValue: DataTypes.NOW(),
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
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CONTACTS_TABLE,
      modelName: "Contact",
      timestamps: true,
      charset: "utf8",
      collate: "utf8_general_ci",
    };
  }
}

module.exports = { CONTACTS_TABLE, ContactModel, Contact };
