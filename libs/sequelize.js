const { Sequelize } = require("sequelize");
const { config } = require("../config/config");
const { setupModesl } = require("../db/models/index");
const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.password);
const { MandatoryData } = require("../db/data/MandatoryData");

require("dotenv").config();

const URI = `mysql://${config.host}:${config.port}/${config.database}`;

const sequelize = new Sequelize(URI, {
  username: USER,
  password: PASSWORD,
  dialect: config.dialect,
  timezone: "-04:00",
  define: {
    timestamps: true,
    createdAt: true,
    updatedAt: true,
  },
});

setupModesl(sequelize);

const options = {
  alter: false,
  force: false,
  logging: console.log,
};

sequelize.sync(options);

module.exports = sequelize;
