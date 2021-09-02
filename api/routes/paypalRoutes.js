"use strict";
const axios = require("axios").default;
const paypalTokenURL = process.env.PAYPAL_TOKEN_URL;
const subscriptionURL = "https://api.paypal.com/v1/billing/subscriptions";
const clientId = process.env.SANDBOX_CLIENT_ID;
const secret = process.env.SANDBOX_SECRET;
const planId = process.env.PLAN_ID;

module.exports = function (app) {
  //Create a new subscription and get id
  app.post("/api/pennybankplus/create/subscription", (req, res, next) => {
    const createSubsription = async () => {
      axios({
        method: "post",
        url: paypalTokenURL,
        data: "grant_type=client_credentials",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
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
              subscriptionURL,
              {
                plan_id: planId,
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
              res.send({
                status: response.data.status,
                subscriptionId: response.data.id,
                link: response.data.links[0].href,
              });
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

  //Check status of a subscription by id
  app.post("/api/pennybankplus/status", (req, res, next) => {
    const subscriptionId = req.body.subscriptionId;
    const getStatus = async () => {
      axios({
        method: "post",
        url: paypalTokenURL,
        data: "grant_type=client_credentials",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
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
            .get(subscriptionURL + "/" + subscriptionId, {
              headers: {
                Accept: "application/json",
                Authorization: "Bearer " + token,
              },
            })
            .then((response) => {
              console.log(response.data);
              res.send({
                status: response.data.status,
                subscriptionId: response.data.id,
              });
            })
            .catch((error) => {
              console.log(error.response);
            });
        })
        .catch((error) => {
          console.log(error.response);
        });
    };
    getStatus();
  });
};
