require("dotenv").config();
const fs = require("fs");
// const key = fs.readFileSync("./key.pem");
// const cert = fs.readFileSync("./cert.pem");
var cors = require("cors");
var express = require("express");
const https = require("https");
const devcert = require("devcert");
var app = express();
port = process.env.PORT || 3000;

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

// const startServer = async () => {
//   let ssl = await devcert.certificateFor("localhost");

//   const server = https.createServer(ssl, app);

//   server.listen(port, () => {
//     console.log("listening on " + port);
//   });
// };
// startServer();

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("WORKING!");
});

app.use(function (req, res) {
  res.status(404).send(req.originalUrl + " 404 error not found");
});
