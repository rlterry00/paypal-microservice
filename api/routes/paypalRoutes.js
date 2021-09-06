var paypalControllers = require("../controllers/paypalControllers");
const { body } = require("express-validator");

module.exports = function (app) {
  //Create a new subscription and get id
  app.post("/api/pennybankplus/create/subscription", paypalControllers.create);

  //Check status of a subscription by id
  app.post(
    "/api/pennybankplus/status",
    body("subscriptionId").isLength({ min: 14, max: 14 }),
    paypalControllers.status
  );

  //Cancel a subscription by id
  app.post("/api/pennybankplus/cancel", paypalControllers.cancel);
};
