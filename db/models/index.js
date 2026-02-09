require("dotenv").config();
const { Contact, ContactModel } = require("./Contacts");
const { Message, MessageModel } = require("./Messages");
const { Category, CategoryModel } = require("./Categories");
const { MessageConfig, MessageConfigModel } = require("./MessageCofing");
const { User, UserModel } = require("./Users");
const { RiskWord, RiskWordModel } = require("./RiskWords");

const {
  VerificationToken,
  VerificationTokenModel,
} = require("./VerificationTokenEmail");

const {
  MessageCategories,
  MessageCategoriesModel,
} = require("./Messages_Categories");

const {
  FailedMessage,
  FailedMessageModel,
} = require("../models/FailedMessages");

const { Campaign, CampaignModel } = require("./Campaigns");
const { CampaignMessage, CampaignMessageModel } = require("./CampaignMessages");
const {
  CampaignRecipient,
  CampaignRecipientModel,
} = require("./CampaignRecipients");
const { MessageLog, MessageLogModel } = require("./MessageLog");
const { Integration, IntegrationModel } = require("./Integrations");

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
    MessageCategories.config(sequelize),
  );
  MessageConfig.init(MessageConfigModel, MessageConfig.config(sequelize));

  FailedMessage.init(FailedMessageModel, FailedMessage.config(sequelize));
  VerificationToken.init(
    VerificationTokenModel,
    VerificationToken.config(sequelize),
  );

  Campaign.init(CampaignModel, Campaign.config(sequelize));
  CampaignMessage.init(CampaignMessageModel, CampaignMessage.config(sequelize));
  CampaignRecipient.init(
    CampaignRecipientModel,
    CampaignRecipient.config(sequelize),
  );
  MessageLog.init(MessageLogModel, MessageLog.config(sequelize));
  Integration.init(IntegrationModel, Integration.config(sequelize));
  RiskWord.init(RiskWordModel, RiskWord.config(sequelize));

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
  Campaign.associate(sequelize.models);
  CampaignMessage.associate(sequelize.models);
  CampaignRecipient.associate(sequelize.models);
  MessageLog.associate(sequelize.models);
  Integration.associate(sequelize.models);
  FailedMessage.associate(sequelize.models);

  // Hooks
  initBDHooks();
}

module.exports = { setupModesl };
