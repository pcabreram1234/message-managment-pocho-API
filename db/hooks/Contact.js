const { Contact } = require("../models/Contacts");
const { User } = require("../models/Users");

const initContactHooks = async () => {
  Contact.addHook("beforeCreate", async (contact, options) => {
    const existEmail = await Contact.findOne({
      where: { email: contact.email, UserId: contact.UserId },
    });

    if (existEmail !== null) {
      throw new Error("This email already exists");
    }

    const existPhoneNumber = await Contact.findOne({
      where: { phone_number: contact.phone_number, UserId: contact.UserId },
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
};

module.exports = { initContactHooks };
