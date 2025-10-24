const express = require("express");
const _ = express.Router();
const variantController = require("../../controllers/variant.controller");
const { upload } = require("../../middleware/multer.middleware");

_.route("/create-variant").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  variantController.createVariant
);
_.route("/all-variant").get(variantController.getAllVariant);
_.route("/single-variant/:slug").get(variantController.singleVariant);
_.route("/upload-variantimage/:slug").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  variantController.uploadVariantImage
);

_.route("/delete-variantimage/:slug").delete(
  variantController.deleteVariantImage
);
_.route("/update-variantinfo/:slug").put(variantController.updateVariantInfo);

module.exports = _;