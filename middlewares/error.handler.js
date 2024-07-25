const fs = require("fs");
const { file } = require("../utils/globals");

function logErrors(err, req, res, next) {
  console.error(err);
  next(err);
}

function writeToLogFile(error, req, res, next) {
  const date = new Date();
  fs.open(file, (err) => {
    const { message } = error;
    const data = error ? message : res;
    fs.writeFile(
      file,
      `${date}:${data.toString()}\n`,
      { encoding: "utf8", flag: "a" },
      (err) => {
        console.log(err);
      }
    );
  });
  // next(error);
}

function errorHandler(err, req, res, next) {
  res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
}

function boomErrorHandler(err, req, res, next) {
  if (err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json(output.payload);
  }
  next(err);
}

function sequeliszeErrorhandler(err, req, res, next) {
  /* Determinar si el objeto error tiene la propiedad errors, 
  de ser asi es debe guardar en un array los mensajes de estas para despues
  enviarlos al servidor */
  if (err.errors) {
    const messagesErrors = err.errors.map((error) => {
      return error.message;
    });
    res.json({ message: messagesErrors });
  }
}

module.exports = {
  logErrors,
  errorHandler,
  boomErrorHandler,
  sequeliszeErrorhandler,
  writeToLogFile,
};
