"use strict";
const axios = require("axios").default;
const paypalTokenURL = process.env.PAYPAL_TOKEN_URL;
const clientId = process.env.SANDBOX_CLIENT_ID;
const secret = process.env.SANDBOX_SECRET;


module.exports = function (app) {
  app.post("/pennybankplus/subscribed", (req, res, next) => {
      res.send(req.body);
      
  });
};
