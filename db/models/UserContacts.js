const { Model, DataTypes, Sequelize } = require("sequelize");
const USER_CONTACTS_TABLE = "UserContacts";

const UserContactsModel = {
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: "User", // Nombre del modelo principal
      key: "id", // Nombre del campo en el modelo principal
    },
    onDelete: "SET NULL", // Eliminar automáticamente las filas de messages_contacts si se elimina un mensaje
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
    onDelete: "SET NULL", // Eliminar automáticamente las filas de messages_contacts si se elimina un contacto
    onUpdate: "CASCADE", // Actualizar automáticamente las referencias en messages_contacts si se actualiza un contacto
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true, // Permitir que el campo deletedAt tenga valores nulos
    defaultValue: Sequelize.fn("CURRENT_TIMESTAMP"),
  },
};

class UserContact extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: USER_CONTACTS_TABLE,
      modelName: "UserContact",
      timestamps: true,
      paranoid: true,
      indexes: [{ fields: ["ContactId", "UserId"] }],
    };
  }
}

module.exports = {
  UserContact,
  UserContactsModel,
};
