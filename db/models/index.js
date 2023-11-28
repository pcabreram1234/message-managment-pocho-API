require("dotenv").config();
const { Contact, ContactModel } = require("./Contacts");
const { Message, MessageModel } = require("./Messages");
const { Category, CategoryModel } = require("./Categories");
const { MessageConfig, MessageConfigModel } = require("./MessageCofing");
const { User, UserModel } = require("./Users");

async function setupModesl(sequelize) {
  /* Creating tables */
  User.init(UserModel, User.config(sequelize));
  Category.init(CategoryModel, Category.config(sequelize));
  Contact.init(ContactModel, Contact.config(sequelize));
  Message.init(MessageModel, Message.config(sequelize));
  MessageConfig.init(MessageConfigModel, MessageConfig.config(sequelize));

  /* Relations setup */
  User.associate(sequelize.models);
  Category.associate(sequelize.models);
  Message.associate(sequelize.models);
  Contact.associate(sequelize.models);
  MessageConfig.associate(sequelize.models);
}

module.exports = { setupModesl };
