var express = require("express");
var app = express();
port = process.env.PORT || 3000;
bodyParser = require('body-parser');

app.get("/url", (req, res, next) => {
 res.json(["Tony","Lisa","Michael","Ginger","Food"]);
});

app.listen(port);

console.log('API server started on: ' + port);