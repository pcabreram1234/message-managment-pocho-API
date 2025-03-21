const jwt = require("jsonwebtoken");
const { models } = require("../libs/sequelize");

async function verifyToken(req, res, next) {
  const token =
    req.cookies?.token ||
    req.headers["authorization"] ||
    req.headers["token"] ||
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const user = await models.User.findOne({
      where: { email: decoded.email, id: decoded.id, active: true },
      attributes: ["email", "user_name", "type_user", "id", "updatedAt"],
    });
    const tokenUpdated = jwt.sign(
      {
        email: user.dataValues.email,
        id: user.dataValues.id,
        type_user: user.dataValues.type_user,
        updatedAt: user.dataValues.updatedAt,
      },
      process.env.TOKEN_KEY,
      { expiresIn: "1h" }
    );
    req.user = user.dataValues;
    req.token = tokenUpdated;
    // res.cookie("token", tokenUpdated, {
    //   httpOnly: process.env.COOKIES_HTTPONLY,
    //   secure: process.env.COOKIES_SECURE,
    //   maxAge: 1000 * 60 * 60,
    //   sameSite: process.env.COOKIES_SAME_SITE,
    //   domain: process.env.CORS_DOMAIN_ALLOWED,
    // });
    res.set("token", req.token);
  } catch (err) {
    return res.status(401).json({ error: err, message: "Login Time Expired" });
  }
  return next();
}

module.exports = { verifyToken };
