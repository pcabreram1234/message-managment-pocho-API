const cors = require("cors");
require("dotenv").config();

cors({
  allowedHeaders: process.env.CORS_ORIGIN_ALLOWED,
  origin: process.env.CORS_ORIGIN_ALLOWED,
  methods: ["GET", "POST"],
});

function verifyLandigHeader(err, req, res, next) {
  // const API_KEY = process.env.TOKEN_STRING;
  const ALLOWED_ORIGIN = process.env.LOGIN_CORS_ORIGIN_ALLOWED;
  // const token =
  //   req.headers["authorization"] ||
  //   req.headers["token"] ||
  //   req.body.token ||
  //   req.query.token ||
  //   req.headers["x-access-token"];

  // const origin = req.headers["origin"] || req.headers["referer"];

  // if (!token) {
  //   return res
  //     .status(403)
  //     .json({ error: "A token is required for authentication" });
  // }

  // if (token !== API_KEY) {
  //   return res.status(403).json({ error: "Invalid token" });
  // }

  if (!origin || origin !== ALLOWED_ORIGIN) {
    return res
      .status(403)
      .json({ error: "Access not permitted from this origin" });
  }

  return next();
}

module.exports = { verifyLandigHeader };
