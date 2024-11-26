const { Op } = require("sequelize");
const { Contact } = require("../models/Contacts");
const { User } = require("../models/Users");

const initContactHooks = async () => {
  Contact.addHook("beforeCreate", async (contact, options) => {
    const { dataValues } = contact;
    const { name, UserId, email, phone_number } = dataValues;

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
    const { dataValues } = contact;
    const { name, email, id, phone_number, UserId } = dataValues;
    const findName = await Contact.findOne({
      where: {
        name: name,
        UserId: UserId,
        id: { [Op.notIn]: [id] },
      },
    });

    if (findName !== null) {
      throw new Error("This contact name already exists");
    }

    const findEmail = await Contact.findOne({
      where: {
        email: email,
        UserId: UserId,
        id: { [Op.notIn]: [id] },
      },
    });

    if (findEmail !== null) {
      throw new Error("This email already exists");
    }

    const findPhoneNumber = await Contact.findOne({
      where: {
        phone_number: phone_number,
        UserId: UserId,
        id: { [Op.notIn]: [id] },
      },
    });

    if (findPhoneNumber !== null) {
      throw new Error("This phone number already exists");
    }
  });
};

module.exports = { initContactHooks };
