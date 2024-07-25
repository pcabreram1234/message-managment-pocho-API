require("dotenv").config();
const { Contact, ContactModel } = require("./Contacts");
const { Message, MessageModel } = require("./Messages");
const { Category, CategoryModel } = require("./Categories");
const { MessageConfig, MessageConfigModel } = require("./MessageCofing");
const { User, UserModel } = require("./Users");
const {
  MessageContacts,
  MessageContactsModel,
} = require("./Messages_Contacts");

const {
  MessageCategories,
  MessageCategoriesModel,
} = require("./Messages_Categories");

const { UserContact, UserContactsModel } = require("./UserContacts");

const { initBDHooks } = require("../hooks/index");

async function setupModesl(sequelize) {
  /* Creating tables */
  User.init(UserModel, User.config(sequelize));
  Contact.init(ContactModel, Contact.config(sequelize));
  Message.init(MessageModel, Message.config(sequelize));
  Category.init(CategoryModel, Category.config(sequelize));
  // UserContact.init(UserContactsModel, UserContact.config(sequelize));
  MessageContacts.init(MessageContactsModel, MessageContacts.config(sequelize));
  MessageCategories.init(
    MessageCategoriesModel,
    MessageCategories.config(sequelize)
  );
  MessageConfig.init(MessageConfigModel, MessageConfig.config(sequelize));

  // Hooks
  initBDHooks();

  /* Relations setup */
  User.associate(sequelize.models);
  Contact.associate(sequelize.models);
  Message.associate(sequelize.models);
  Category.associate(sequelize.models);
  MessageContacts.associate(sequelize.models);
  MessageCategories.associate(sequelize.models);
  MessageConfig.associate(sequelize.models);
}

module.exports = { setupModesl };
