const { Model, DataTypes } = require("sequelize");
const MESSAGE_CONTACTS_TABLE = "messages_contacts";

const MessageContactsModel = {
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
  ContactId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: "Contact", // Nombre del modelo principal
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

class MessageContacts extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: MESSAGE_CONTACTS_TABLE,
      modelName: "messages_contacts",
      timestamps: true,
      paranoid: true,
    };
  }

  static associate(models) {
    this.belongsTo(models.Contact, {
      foreignKey: { field: "id", name: "ContactId" },
    });
    this.belongsTo(models.Message, {
      foreignKey: { field: "id", name: "MessageId" },
    });
  }
}

module.exports = {
  MessageContacts,
  MessageContactsModel,
  MESSAGE_CONTACTS_TABLE,
};
