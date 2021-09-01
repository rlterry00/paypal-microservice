"use strict";
const axios = require("axios").default;



module.exports = function (app) {
  app.post("/pennybankplus/subscribed", (req, res, next) => {
    res.send(req.body);
  });
};
