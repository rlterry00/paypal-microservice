require("dotenv").config();
const fs = require("fs");
const key = fs.readFileSync("./key.pem");
const cert = fs.readFileSync("./cert.pem");
var express = require("express");
const https = require("https");
var app = express();
port = process.env.PORT || 3000;

bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require("./api/routes/paypalRoutes");
routes(app);

const server = https.createServer({ key: key, cert: cert }, app);

server.listen(port, () => {
  console.log("listening on " + port);
});

app.use(function (req, res) {
  res.status(404).send(req.originalUrl + " 404 error not found");
});
