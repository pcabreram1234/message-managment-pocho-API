const { Op } = require("sequelize");
const { Contact } = require("../models/Contacts");
const { User } = require("../models/Users");

const initContactHooks = async () => {
  Contact.addHook("beforeCreate", async (contact, options) => {
    const { dataValues } = contact;
    const { name, UserId, email, phone_number } = dataValues;

    const digitsOnly = phone_number.replace(/\D/g, "");

    if (digitsOnly.length !== 10) {
      throw new Error("Phone number must have 10 digits");
    }

    contact.phone_number = `${digitsOnly.substring(
      0,
      3
    )}-${digitsOnly.substring(3, 6)}-${digitsOnly.substring(6)}`;

    const existName = await Contact.findOne({
      where: {
        name: name,
        UserId: UserId,
      },
    });

    if (existName !== null) {
      throw new Error("This contact name already exists");
    }
    const existEmail = await Contact.findOne({
      where: { email: email, UserId: UserId },
    });

    if (existEmail !== null) {
      throw new Error("This email already exists");
    }

    const existPhoneNumber = await Contact.findOne({
      where: { phone_number: phone_number, UserId: UserId },
    });

    if (existPhoneNumber !== null) {
      throw new Error("This Phone Number already exists");
    }
  });

  Contact.addHook("afterCreate", async (contact, options) => {
    const { dataValues } = contact;
    const { id, UserId } = dataValues;
    const user = await User.findByPk(UserId);
    console.log(options);
    console.log(UserId);
    await contact.addUser(user);
    console.log(contact);
  });

  Contact.addHook("beforeUpdate", async (contact, optios) => {
    const { id, UserId, name, email, phone_number } = contact;
    console.log(contact);
    const existingContact = await Contact.findByPk(id);
    if (!existingContact) throw new Error("Contact not found");

    if (
      name === existingContact.name &&
      email === existingContact.email &&
      phone_number === existingContact.phone_number
    ) {
      console.log("SIn cambios");
      return; // No cambios, no se realiza validación
    }

    const updates = {};
    if (name !== existingContact.name) updates.name = name;
    if (email !== existingContact.email) updates.email = email;
    if (phone_number !== existingContact.phone_number)
      updates.phone_number = phone_number;

    if (Object.keys(updates).length > 0) {
      const duplicate = await Contact.findOne({
        where: {
          UserId,
          [Op.or]: [
            updates.name ? { name: updates.name } : {},
            updates.email ? { email: updates.email } : {},
            updates.phone_number ? { phone_number: updates.phone_number } : {},
          ],
          id: { [Op.not]: id },
        },
      });

      if (duplicate) {
        if (duplicate.name === updates.name)
          throw new Error("This contact name already exists");
        if (duplicate.email === updates.email)
          throw new Error("This email already exists");
        if (duplicate.phone_number === updates.phone_number)
          throw new Error("This phone number already exists");
      }
    }
  });
};

module.exports = { initContactHooks };
