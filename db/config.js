const { config } = require("../config/config");
const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.password);

const URI = `mysql://${USER}:${PASSWORD}@${config.host}:${config.port}/${config.database}`;

module.exports = {
  development: {
    username: USER,
    password: PASSWORD,
    database: config.database,
    host: config.host,
    dialect: "mysql",
  },
  production: {
    username: USER,
    password: PASSWORD,
    database: config.database,
    host: config.host,
    dialect: "mysql", 
  },
};
