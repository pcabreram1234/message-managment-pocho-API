const { Model, DataTypes } = require("sequelize");
const MESSAGE_CATEGORIES_TABLE = "messages_categories";

const MessageCategoriesModel = {
  MessageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: "Message", // Nombre del modelo principal
      key: "id", // Nombre del campo en el modelo principal
    },
    onDelete: "CASCADE", // Eliminar automáticamente las filas de messages_contacts si se elimina un mensaje
    onUpdate: "CASCADE", // Actualizar automáticamente las referencias en messages_contacts si se actualiza un mensaje
  },
  CategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: "Category", // Nombre del modelo principal
      key: "id", // Nombre del campo en el modelo principal
    },
    onDelete: "CASCADE", // Eliminar automáticamente las filas de messages_contacts si se elimina un contacto
    onUpdate: "CASCADE", // Actualizar automáticamente las referencias en messages_contacts si se actualiza un contacto
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true, // Permitir que el campo deletedAt tenga valores nulos
    defaultValue: null,
  },
};

class MessageCategories extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: MESSAGE_CATEGORIES_TABLE,
      modelName: "messages_categories",
      timestamps: true,
      paranoid: true,
    };
  }

  static associate(models) {
    this.belongsTo(models.Category, {
      foreignKey: { field: "id", name: "CategoryId" },
    });

    this.belongsTo(models.Message, {
      foreignKey: { field: "id", name: "MessageId" },
    });
  }
}

module.exports = {
  MessageCategories,
  MessageCategoriesModel,
};
