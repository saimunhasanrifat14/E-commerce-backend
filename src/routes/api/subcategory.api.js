const express = require("express");
const router = express.Router();
const {
  createSubCategory,
  getAllSubCategories,
  getSingleSubCategory,
} = require("../../controllers/subcategory.controller");

router.route("/create-subcategory").post(createSubCategory);
router.route("/get-all-subcategories").get(getAllSubCategories);
router.route("/get-single-subcategory/:slug").get(getSingleSubCategory);

module.exports = router;
