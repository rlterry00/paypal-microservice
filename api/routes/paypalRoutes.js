var paypal_controller = require("../controllers/paypalControllers");

module.exports = function (app) {
  //Create a new subscription and get id
  app.post("/api/pennybankplus/create/subscription", paypal_controller.create);

  //Check status of a subscription by id
  app.post("/api/pennybankplus/status", paypal_controller.status);

  //Cancel a subscription by id
  app.post("/api/pennybankplus/cancel", paypal_controller.cancel);
};
