const express = require("express");
const app = express();
const routerApi = require("./routes/index.Routes");
const cors = require("cors");
require("dotenv").config();

const {
  logErrors,
  errorHandler,
  boomErrorHandler,
  sequeliszeErrorhandler,
  writeToLogFile,
} = require("./middlewares/error.handler");

const port = process.env.PORT || 3120;

const corsOption = {
  origin: [
    process.env.CORS_ORIGIN_ALLOWED,
    process.env.LOGIN_CORS_ORIGIN_ALLOWED,
  ],
  exposedHeaders: ["token"],
  methods: ["GET", "POST", "DELETE", "PATCH"],
};

app.use(express.json());

app.use(cors(corsOption));

app.get("/", (req, res) => {
  res.send("Hola mi server en express");
});

routerApi(app);

app.use(logErrors);
app.use(errorHandler);
app.use(sequeliszeErrorhandler);
app.use(writeToLogFile);
app.use(boomErrorHandler);

const server = app.listen(port, () => {
  console.log("Mi port " + port);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
