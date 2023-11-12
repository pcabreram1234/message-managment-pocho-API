const { Model, DataTypes, Sequelize } = require("sequelize");
const CATEGORY_TABLE = "categories";
const { USER_TABLE } = require("../models/Users");

const CategoryModel = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  categorie_name: {
    allowNull: false,
    type: DataTypes.STRING(255),
    length: 50,
  },
  associate_to: {
    allowNull: true,
    type: Sequelize.JSON,
    defaultValue: [],
    get() {
      const rawValue = JSON.parse(this.getDataValue("associate_to"));
      return rawValue.length > 0 ? rawValue : [];
    },
  },
  createdAt: {
    allowNull: false,
    type: "timestamp",
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

class Category extends Model {
  static associate(models) {
    this.belongsTo(models.User);
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CATEGORY_TABLE,
      modelName: "Category",
      timestamps: true,
    };
  }
}

module.exports = { CATEGORY_TABLE, CategoryModel, Category };
