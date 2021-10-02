require("dotenv").config();
const fs = require("fs");
const winston = require("winston");
// const key = fs.readFileSync("./key.pem");
// const cert = fs.readFileSync("./cert.pem");
const morgan = require("morgan");
var cors = require("cors");
var express = require("express");
const https = require("https");

const path = require("path");
const app = express();
port = process.env.PORT || 3000;
const { createLogger, transports } = require("winston");
require("winston-daily-rotate-file");



const logger = createLogger({
  level: "info",
  transports: [
    new transports.DailyRotateFile({
      filename: "./logs/info-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      format: winston.format.combine(
        winston.format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
        winston.format.align(),
        winston.format.printf(
          (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
        )
      ),
    }),
  ],
});



app.use(
  morgan("combined", { stream: { write: (message) => logger.info(message) } })
);

app.use(
  cors({
    origin: "*",
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require("./api/routes/paypalRoutes");
routes(app);



app.use((req, res, next) => {
    const err = new Error("Not Found")
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
  logger.info(`Server started and running on http://localhost:${port}`);
});


