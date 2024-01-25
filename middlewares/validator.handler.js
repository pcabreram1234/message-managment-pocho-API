const boom = require("@hapi/boom");

function validatorHandler(schema, property) {
  return (err, req, res, next) => {
    const data = req[property];
    console.log(data);
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      alert(error);
      next(boom.badRequest(error));
    }
    next();
  };
}

module.exports = { validatorHandler };
