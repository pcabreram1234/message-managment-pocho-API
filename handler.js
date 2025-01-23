const express = require("express");
const awsServerlessExpress = require("aws-serverless-express");
const app = express();
const routerApi = require("./routes/index.Routes");
require("dotenv").config();

const {
  logErrors,
  errorHandler,
  boomErrorHandler,
  sequeliszeErrorhandler,
  writeToLogFile,
} = require("./middlewares/error.handler");


app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hola mi server en express");
});

routerApi(app);

app.use(logErrors);
app.use(errorHandler);
app.use(sequeliszeErrorhandler);
app.use(writeToLogFile);
app.use(boomErrorHandler);

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
};
