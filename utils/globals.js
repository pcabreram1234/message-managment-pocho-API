const path = require("path");

const file = path.join(__dirname, process.env.LOG_FILE_PATH);
const currentDate = new Date();

module.exports = { file, currentDate };
