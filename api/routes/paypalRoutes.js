"use strict";
const axios = require("axios").default;
const paypalTokenURL = process.env.PAYPAL_TOKEN_URL;
const clientId = process.env.SANDBOX_CLIENT_ID;
const secret = process.env.SANDBOX_SECRET;

module.exports = function (app) {
  app.post("/pennybankplus/subscribed", (req, res, next) => {
    res.send(req.body);
    const getToken = async () => {
      const params = new URLSearchParams();
      params.append("grant_type", "client_credentials");
      axios
        .post(
          paypalTokenURL,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": "en_US",
              "content-type": "application/x-www-form-urlencoded",
            },
          },
          {
            auth: {
              username: clientId,
              password: secret,
            },
          },
          {
            params: {
              grant_type: "client_credentials",
            },
          }
        )
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error.response);
        });
    };
    getToken();
  });
};
