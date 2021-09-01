"use strict";
const axios = require("axios").default;
const paypalTokenURL = process.env.PAYPAL_TOKEN_URL;
const clientId = process.env.SANDBOX_CLIENT_ID;
const secret = process.env.SANDBOX_SECRET;

module.exports = function (app) {
  app.post("/pennybankplus/subscribed", (req, res, next) => {
    res.send(req.body);
    const getToken = async () => {
      axios({
        method: "post",
        url: "https://api.sandbox.paypal.com/v1/oauth2/token",
        data: "grant_type=client_credentials", // => this is mandatory x-www-form-urlencoded. DO NOT USE json format for this
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded", // => needed to handle data parameter
          "Accept-Language": "en_US",
        },
        auth: {
          username: clientId,
          password: secret,
        },
      })
        .then((response) => {
          console.log(response.data.access_token);
        })
        .catch((error) => {
          console.log(error.response);
        });
    };
    getToken();
  });
};
