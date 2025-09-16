const express = require("express");
const router = express.Router();
const {
  createDiscount,
  getAllDiscount,
  getSingleDiscount,
} = require("../../controllers/discount.controller");

router.route("/create-discount").post(createDiscount);
router.route("/get-all-discount").get(getAllDiscount);
router.route("/get-single-discount/:slug").get(getSingleDiscount);

module.exports = router;
