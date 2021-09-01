var express = require("express");
var app = express();
port = process.env.PORT || 3000;

bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/paypalRoutes'); 
routes(app); 

app.use(function (req, res) {
  res.status(404).send( req.originalUrl + " 404 error not found" );
});

app.listen(port);

console.log('API server started on: ' + port);