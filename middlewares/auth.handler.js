const jwt = require("jsonwebtoken");
const { models } = require("../libs/sequelize");

async function verifyToken(req, res, next) {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const user = await models.User.findOne({
      where: { email: decoded.email, id: decoded.id, active: true },
    });
    const tokenUpdated = jwt.sign(
      {
        email: user.dataValues.email,
        id: user.dataValues.id,
        type_user: user.dataValues.type_user,
      },
      process.env.TOKEN_KEY,
      { expiresIn: "1h" }
    );
    req.user = user.dataValues;
    req.token = tokenUpdated;
    res.set("token", req.token);
  } catch (err) {
    return res.status(401).json({ error: err });
  }
  return next();
}

module.exports = { verifyToken };
