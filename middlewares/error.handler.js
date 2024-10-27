const fs = require("fs");
const { file } = require("../utils/globals");
const { verifyToken } = require("./auth.handler");

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
  verifyToken(req, res, next);
  if (
    err instanceof Sequelize.ValidationError ||
    err instanceof Sequelize.DatabaseError
  ) {
    // Manejar errores específicos de Sequelize
    console.error("Error de Sequelize:", err);
    return res.status(400).json({
      error: "Datos inválidos " + err,
      // details: err.errors.map((e) => e.message),
    });
  } else if (err instanceof Error && err.name === "SequelizeDatabaseError") {
    // Manejar otros errores de base de datos
    console.error("Error de base de datos:", err);
    return res.status(500).json({
      error: "Error al acceder a la base de datos",
    });
  } else {
    // Manejar otros tipos de errores
    console.error("Error inesperado:", err);
    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

module.exports = {
  logErrors,
  errorHandler,
  boomErrorHandler,
  sequeliszeErrorhandler,
  writeToLogFile,
};
