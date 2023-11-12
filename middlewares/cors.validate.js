const cors = require("cors");
require("dotenv").config();

cors({
  allowedHeaders: process.env.CORS_ORIGIN_ALLOWED,
  origin: process.env.CORS_ORIGIN_ALLOWED,
  methods: ["GET", "POST"],
});
