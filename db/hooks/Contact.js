const { Contact } = require("../models/Contacts");
const { UserContact } = require("../models/UserContacts");

const initContactHooks = async () => {
  // Agrega el gancho (hook) afterCreate en el modelo Contact
  Contact.addHook("afterCreate", async (contact, options) => {
    console.log("Se ha creado");
    console.log(contact);
    // Verificar si el contacto ya existe en la tabla UserContact
    const existInUserContact = await UserContact.findOne({
      where: {
        UserId: contact.UserId,
        ContactId: contact.id,
      },
    });

    if (existInUserContact !== null) {
      // Si el contacto ya existe en UserContact, lanzar un error
      throw new Error("This contact already exists in UserContact");
    } else {
      // Si no existe, agregar el contacto a UserContact
      await UserContact.create({
        UserId: contact.UserId,
        ContactId: contact.id,
        deletedAt: null,
      });
    }
  });

  Contact.addHook("beforeCreate", async (contact, options) => {
    const existEmail = await Contact.findOne({
      where: { email: contact.email },
    });

    if (existEmail !== null) {
      throw new Error("This email already exists");
    }

    const existPhoneNumber = await Contact.findOne({
      where: { phone_number: contact.phone_number },
    });
    if (existPhoneNumber !== null) {
      throw new Error("This Phone Number already exists");
    }
  });

  Contact.addHook("beforeCreate", async (contact, options) => {
    console.log(contact.dataValues);
    await UserContact.destroy({
      where: {
        UserId: contact.dataValues.UserId,
        ContactId: contact.dataValues.ContactId,
      },
    });
  });

  Contact.addHook("beforeDestroy", async (contact, options) => {
    options.logging = true;

    try {
      console.log("Intentando antes de borrar");

      await UserContact.update(
        {
          deletedAt: Sequelize.fn("CURRENT_TIMESTAMP"),
        },
        {
          where: {
            UserId: contact.UserId,
            ContactId: contact.ContactId,
          },
        }
      );
    } catch (error) {
      console.log("Error deleting associated UserContact", error);
    }
  });
};

module.exports = { initContactHooks };
