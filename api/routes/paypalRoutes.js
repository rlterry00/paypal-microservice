var paypalControllers = require("../controllers/paypalControllers");
const { body } = require("express-validator");

module.exports = function (app) {
  //Create an auth JWT based on valid token from penny bank.
  app.post("/sub/api/pennybankplus/auth", paypalControllers.auth);

  //Create a new subscription and get id
  app.post(
    "/sub/api/pennybankplus/create/subscription",
    paypalControllers.create
  );

  //Create a new subscription with free trial and get id
  app.post(
    "/sub/api/pennybankplus/create/trial/subscription",
    paypalControllers.createTrial
  );

  //Check status of a subscription by id
  app.post(
    "/sub/api/pennybankplus/status",
    body("subscriptionId").isLength({ min: 14, max: 14 }),
    paypalControllers.status
  );

  //Cancel a subscription by id
  app.post(
    "/sub/api/pennybankplus/cancel",
    body("subscriptionId").isLength({ min: 14, max: 14 }),
    paypalControllers.cancel
  );
};
