const { Sequelize } = require("sequelize");
const { config } = require("../config/config");
const { setupModesl } = require("../db/models/index");
const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.password);

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
// MandatoryData();
sequelize
  .sync(options)
  .then((resp) => {
    console.log(resp.models);
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = sequelize;
