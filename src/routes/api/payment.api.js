const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/payment.controller");

router.route("/success").post(paymentController.successPayment);
router.route("/fail").post(paymentController.failPayment);
router.route("/cancle").post(paymentController.canclePayment);
router.route("/ipn").post(paymentController.ipnPayment);

module.exports = router;