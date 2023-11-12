const fs = require("fs");
const { currentDate } = require("../utils/globals");

const handleLogs = (file, data) => {
  fs.open(file, "r+", (err, fd) => {
    fs.writeFile(
      file,
      `${currentDate}:${data.toString()}\n`,
      { encoding: "utf8", flag: "a" },
      (err) => {
        // console.log(err);
      }
    );
  });
};

module.exports = { handleLogs };
