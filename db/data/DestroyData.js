const { Category } = require("../models/Categories");
const { Contact } = require("../models/Contacts");
const { Message } = require("../models/Messages");
const { MessageConfig } = require("../models/MessageCofing");
const { User } = require("../models/Users");

const deleteTablesRows = (sequelize) => {
  // User.destroy({ truncate: true });
  // Category.destroy({ truncate: true, cascade: false, restartIdentity: true });
  // Contact.destroy({ truncate: true });
  // Message.destroy({ truncate: true });
  // MessageConfig.destroy({ truncate: true });
  sequelize.destroy({ truncate: true, cascade: true });
};

module.exports = { deleteTablesRows };
