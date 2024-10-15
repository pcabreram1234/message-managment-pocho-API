const { Model, DataTypes, Sequelize } = require("sequelize");
const USER_CONTACTS_TABLE = "users_contacts";

const UserContactModel = {
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: "User", // Nombre del modelo principal
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

class UserContact extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: USER_CONTACTS_TABLE,
      modelName: "UserContact",
      timestamps: true,
      paranoid: true,
    };
  }

  static associate(models) {
    this.hasMany(models.Contact, {
      foreignKey: { field: "id", name: "ContactId" },
    });

    this.hasMany(models.User, {
      foreignKey: { field: "id", name: "UserId" },
    });
  }
}

module.exports = {
  UserContact,
  UserContactModel,
};
