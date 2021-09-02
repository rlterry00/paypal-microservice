"use strict";
const axios = require("axios").default;
const paypalTokenURL = process.env.PAYPAL_TOKEN_URL;
const subscriptionURL =
  "https://api.paypal.com/v1/billing/subscriptions/I-3SHRMPFTVBU4";
const createSubscriptionURL = "https://api.paypal.com/v1/billing/subscriptions";
const clientId = process.env.SANDBOX_CLIENT_ID;
const secret = process.env.SANDBOX_SECRET;
const planId = process.env.PLAN_ID;

module.exports = function (app) {
  app.post("/pennybankplus/create/subscription", (req, res, next) => {
    res.send(req.body);
    const createSubsription = async () => {
      axios({
        method: "post",
        url: "https://api.paypal.com/v1/oauth2/token",
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
          const token = response.data.access_token;
          axios
            .post(
              createSubscriptionURL,
              {
                plan_id: planId
              },
              {
                headers: {
                  Accept: "application/json",
                  Authorization: "Bearer " + token,
                },
              }
            )
            .then((response) => {
              console.log(response.data);
            })
            .catch((error) => {
              console.log(error.response);
            });
        })
        .catch((error) => {
          console.log(error.response);
        });
    };
    createSubsription();
  });
};
