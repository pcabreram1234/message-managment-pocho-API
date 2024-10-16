const express = require("express");
const app = express();
const routerApi = require("./routes/index.Routes");
const cors = require("cors");

const {
  logErrors,
  errorHandler,
  boomErrorHandler,
  sequeliszeErrorhandler,
  writeToLogFile,
} = require("./middlewares/error.handler");

const port = process.env.PORT || 3120;

const corsOption = {
  origin: process.env.CORS_ORIGIN_ALLOWED,
  exposedHeaders: ["token"],
};

app.use(express.json());

app.use(cors(corsOption));

app.get("/", (req, res) => {
  res.send("Hola mi server en express");
});

routerApi(app);

app.use(errorHandler);
app.use(writeToLogFile);
app.use(logErrors);
app.use(boomErrorHandler);
app.use(sequeliszeErrorhandler);

app.listen(port, () => {
  console.log("Mi port " + port);
});
