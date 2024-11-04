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
  VerificationToken,
  VerificationTokenModel,
} = require("./VerificationTokenEmail");

const {
  MessageCategories,
  MessageCategoriesModel,
} = require("./Messages_Categories");

const { UserContact, UserContactModel } = require("../models/UserContacts");
const {
  FailedMessage,
  FailedMessageModel,
} = require("../models/FailedMessages");

const { initBDHooks } = require("../hooks/index");

async function setupModesl(sequelize) {
  /* Creating tables */
  User.init(UserModel, User.config(sequelize));
  Contact.init(ContactModel, Contact.config(sequelize));
  // UserContact.init(UserContactModel, UserContact.config(sequelize));
  Message.init(MessageModel, Message.config(sequelize));
  Category.init(CategoryModel, Category.config(sequelize));
  // MessageContacts.init(MessageContactsModel, MessageContacts.config(sequelize));
  MessageCategories.init(
    MessageCategoriesModel,
    MessageCategories.config(sequelize)
  );
  MessageConfig.init(MessageConfigModel, MessageConfig.config(sequelize));

  FailedMessage.init(FailedMessageModel, FailedMessage.config(sequelize));
  VerificationToken.init(
    VerificationTokenModel,
    VerificationToken.config(sequelize)
  );

  /* Relations setup */
  User.associate(sequelize.models);
  Contact.associate(sequelize.models);
  // UserContact.associate(sequelize.models);
  Message.associate(sequelize.models);
  Category.associate(sequelize.models);
  // MessageContacts.associate(sequelize.models);
  MessageCategories.associate(sequelize.models);
  MessageConfig.associate(sequelize.models);
  VerificationToken.associate(sequelize.models);

  // Hooks
  initBDHooks();
}

module.exports = { setupModesl };
