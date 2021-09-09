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

//Create an auth JWT based on valid token from penny bank.
exports.auth = (req, res, next) => {
  const token = req.headers.authorization;
  const userId = req.headers.userid;
  const getFamilyURL = checkFamilyURL + userId;

  axios
    .get(getFamilyURL, {
      headers: {
        Authorization: token,
      },
    })
    .then((response) => {
      const authToken = jwt.sign({ token: token, userId: userId }, authSecret, {
        expiresIn: 600,
      });
      res.send({
        status: 200,
        authToken: authToken,
      });
    })
    .catch((error) => {
      throw new Error(res.status(401).send("Token not valid"));
    });
};

//Create a new subscription and get id
exports.create = (req, res, next) => {
  const authToken = req.headers.authorization;
  jwt.verify(authToken, authSecret, (err, decoded) => {
    const pbToken = decoded.token;
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
                    updateSubscriberURL,
                    {
                      subscriberId: response.data.id,
                    },
                    {
                      headers: {
                        Authorization: pbToken,
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
                  res.send({
                    status: response.data.status,
                    subscriptionId: response.data.id,
                  });
                })
                .catch((error) => {
                  console.log(error.response);
                  if (error.response.status == 404) {
                    res.send({
                      status: error.response.status,
                      error: "Subscription ID no longer valid",
                    });
                  } else {
                    res.send({
                      status: error.response.status,
                      error: error.response.statusText,
                    });
                  }
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
                    reason: "Not satisfied with the service",
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
                    status: response,
                  });
                })
                .catch((error) => {
                  console.log(error.response);
                  if (error.response.status == 404) {
                    res.send({
                      status: error.response.status,
                      error: "Subscription ID no longer valid or not active",
                    });
                  } else {
                    res.send({
                      status: error.response.status,
                      error: error.response.statusText,
                    });
                  }
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
