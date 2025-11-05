const { apiResponse } = require("../utils/apiResponse");
const { asynchandeler } = require("../utils/asynchandeler");
const { CustomError } = require("../utils/CustomError");
const orderModel = require("../models/order.model");
const SSLCommerzPayment = require("sslcommerz-lts");
const store_id = process.env.SSLC_STORE_ID;
const store_passwd = process.env.SSLC_STORE_PASSWORD;
const is_live = process.env.NODE_ENV == "developement" ? false : true;
// sucess
exports.successPayment = asynchandeler(async (req, res) => {
  const { val_id } = req.body;
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const validateData = await sslcz.validate({ val_id });

  const { status, tran_id } = validateData;

  await orderModel.findOneAndUpdate(
    {
      transactionId: tran_id,
    },
    {
      paymentStatus: status == "VALID" && "success",
      transactionId: tran_id,
      paymentGatewayData: validateData,
      orderStatus: "Confirmed",
    }
  );
  apiResponse.sendSucess(res, 200, "payment sucess", null);
});

exports.failPayment = asynchandeler(async (req, res) => {
  console.log(req.body);
  return res.redirect("https://www.npmjs.com/package/chalk/v/4.1.2");
});
exports.canclePayment = asynchandeler(async (req, res) => {
  console.log(req.body);
  return res.redirect("https://www.npmjs.com/package/chalk/v/4.1.2");
});
exports.ipnPayment = asynchandeler(async (req, res) => {
  console.log(req.body);
  apiResponse.sendSucess(res, 200, "ipn notification", req.body);
});