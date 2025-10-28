const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/customerReview.controller");
const { upload } = require("../../middleware/multer.middleware");

// create customer review
router.route("/create-customerReview").post(
  upload.fields([{ name: "image", maxCount: 5 }]),
  customerController.createCustomerReview
);
// remove customer review
router.route("/remove-customerReview/:slug").delete(
  customerController.deleteProdutReview
);
// edit customer review
router.route("/edit-customerReview").put(customerController.editProdutReview);

module.exports = router;
