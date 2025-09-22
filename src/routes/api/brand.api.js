const express = require("express");
const router = express.Router();
const {
  createBrand,
  getAllBrands,
  getSingleBrand,
  updateBrand,
  deleteBrand,
} = require("../../controllers/brand.controller");
const { upload } = require("../../middleware/multer.middleware");

// all brand routes
router
  .route("/create-brand")
  .post(upload.fields([{ name: "image", maxCount: 1 }]), createBrand);
router.route("/get-all-brands").get(getAllBrands);
router.route("/get-single-brand/:slug").get(getSingleBrand);
router
  .route("/update-brand/:slug")
  .put(upload.fields([{ name: "image", maxCount: 1 }]), updateBrand);
router.route("/delete-brand/:slug").delete(deleteBrand);

module.exports = router;
