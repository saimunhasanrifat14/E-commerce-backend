const express = require("express");
const router = express.Router();
const variantController = require("../../controllers/variant.controller");
const { upload } = require("../../middleware/multer.middleware");

router.route("/create-variant").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  variantController.createVariant
);
router.route("/all-variant").get(variantController.getAllVariant);
router.route("/single-variant/:slug").get(variantController.singleVariant);
router.route("/upload-variantimage/:slug").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  variantController.uploadVariantImage
);

router.route("/delete-variantimage/:slug").delete(
  variantController.deleteVariantImage
);
router.route("/update-variantinfo/:slug").put(variantController.updateVariantInfo);

module.exports = router;