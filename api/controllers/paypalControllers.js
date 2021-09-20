"use strict";
const axios = require("axios").default;
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const paypalTokenURL = process.env.PAYPAL_TOKEN_URL;
const subscriptionURL = process.env.PAYPAL_SUBSCRIPTION_URL;
const checkFamilyURL = process.env.CHECK_FAMILY_URL;
const updateSubscriberURL = process.env.UPDATE_SUBSCRIBER_URL;
const clientId = process.env.CLIENT_ID;
const secret = process.env.PAYPAL_SECRET;
const planId = process.env.PLAN_ID;
const authSecret = process.env.AUTH_SECRET;
const pbCred = process.env.PB_CRED;
const pbAuth = process.env.PB_AUTH;
const moment = require("moment");
const logger = require("../../utils/logger"); 

//Create an auth JWT based on valid token from penny bank.
exports.auth = (req, res, next) => {
  const token = req.headers.authorization;
  const userId = req.headers.userid;
  const getFamilyURL = checkFamilyURL + userId;
  logger.info(`Test log on auth`);

  axios
    .get(updateSubscriberURL + userId, {
      headers: {
        Authorization: token,
        "Subsvr-Creds": pbCred,
        "Subsvr-Auth": pbAuth,
      },
    })
    .then((response) => {
      console.log(response.data);
      const authToken = jwt.sign({ token: token, userId: userId }, authSecret, {
        expiresIn: 600,
      });
      if (response.data.subscriberId) {
        res.send({
          status: 200,
          authToken: authToken,
          subscription: response.data.subscriberId,
        });
      } else {
        res.send({
          status: 404,
          authToken: authToken,
          message: "subscription id not found",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      // throw new Error(res.status(401).send("Token not valid"));
      res.send({
        status: 404,
        authToken: authToken,
        message: "subscription id not found",
      });
    });
};

//Create a new subscription and get id
exports.create = (req, res, next) => {
  const authToken = req.headers.authorization;
  jwt.verify(authToken, authSecret, (err, decoded) => {
    const pbToken = decoded.token;
    const familyId = decoded.userId;
    if (!err) {
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
                axios
                  .patch(
                    updateSubscriberURL + familyId + "/update",
                    {
                      subscriberId: response.data.id,
                    },
                    {
                      headers: {
                        Authorization: pbToken,
                        "Subsvr-Creds": pbCred,
                        "Subsvr-Auth": pbAuth,
                      },
                    }
                  )
                  .then((response) => {
                    console.log(response.data);
                  })
                  .catch((error) => {
                    console.log(error.response);
                  });
                res.send({
                  status: response.data.status,
                  subscriptionId: response.data.id,
                  link: response.data.links[0].href,
                });
              })
              .catch((error) => {
                console.log(error.response);
                res.send({
                  status: error.response.status,
                  error: error.response.statusText,
                });
              });
          })
          .catch((error) => {
            console.log(error.response);
            res.send({
              status: error.response.status,
              error: error.response.statusText,
            });
          });
      };
      createSubsription();
    } else {
      throw new Error(res.status(401).send("Token not valid"));
    }
  });
};

//Check status of a subscription by id
exports.status = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    const authToken = req.headers.authorization;
    jwt.verify(authToken, authSecret, (err, decoded) => {
      const pbToken = decoded.token;
      const familyId = decoded.userId;
      if (!err) {
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
                  const nextBilling = moment
                    .utc(response.data.billing_info.next_billing_time)
                    .local()
                    .format("YYYY-MM-DDTHH:mm:ss");
                  const nextBillingClient = moment
                    .utc(response.data.billing_info.next_billing_time)
                    .local()
                    .format("MMMM Do, YYYY");
                  const activeFrom = moment
                    .utc(response.data.create_time)
                    .local()
                    .format("YYYY-MM-DDTHH:mm:ss");
                  console.log(nextBilling, activeFrom);
                  if (response.data.status !== "APPROVAL_PENDING") {
                    axios
                      .patch(
                        updateSubscriberURL + familyId + "/update",
                        {
                          active:
                            response.data.status == "ACTIVE" ? true : false,
                          subscriberId: response.data.id,
                          planId: response.data.plan_id,
                          emailAddress: response.data.subscriber.email_address,
                          nextBillingTime: nextBilling,
                          activeFrom: activeFrom,
                        },
                        {
                          headers: {
                            Authorization: pbToken,
                            "Subsvr-Creds": pbCred,
                            "Subsvr-Auth": pbAuth,
                          },
                        }
                      )
                      .then((response) => {
                        console.log(response.data);
                      })
                      .catch((error) => {
                        console.log(error.response);
                      });
                  }

                  res.send({
                    status: response.data.status,
                    subscriptionId: response.data.id,
                    nextBill: nextBillingClient
                  });
                })
                .catch((error) => {
                  console.log(error.response);
                  // if (error.response.status == 404) {
                  //   res.send({
                  //     status: error.response.status,
                  //     error: "Subscription ID no longer valid",
                  //   });
                  // } else {
                  //   res.send({
                  //     status: error.response.status,
                  //     error: error.response.statusText,
                  //   });
                  // }
                });
            })
            .catch((error) => {
              console.log(error.response);
              res.send({
                status: error.response.status,
                error: error.response.statusText,
              });
            });
        };
        getStatus();
      } else {
        throw new Error(res.status(401).send("Token not valid"));
      }
    });
  }
};

//Cancel a subscription by id
exports.cancel = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    const authToken = req.headers.authorization;
    const reason = req.body.reason;
    jwt.verify(authToken, authSecret, (err, decoded) => {
      if (!err) {
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
                .post(
                  subscriptionURL + "/" + subscriptionId + "/cancel",
                  {
                    reason: req.body.reason,
                  },
                  {
                    headers: {
                      Accept: "application/json",
                      Authorization: "Bearer " + token,
                    },
                  }
                )
                .then((response) => {
                  //paypal doesnt send a response
                  res.send({
                    status: "canceled",
                  });
                })
                .catch((error) => {
                  //paypal doesnt send a response
                  res.send({
                    status: "canceled",
                  });
                  
                });
            })
            .catch((error) => {
              console.log(error.response);
              res.send({
                status: error.response.status,
                error: error.response.statusText,
              });
            });
        };
        getStatus();
      } else {
        throw new Error(res.status(401).send("Token not valid"));
      }
    });
  }
};
