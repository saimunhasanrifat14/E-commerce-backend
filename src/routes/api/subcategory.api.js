const express = require("express");
const router = express.Router();
const {
  createSubCategory,
  getAllSubCategories,
  getSingleSubCategory,
  updateSubcategory,
  deleteSubcategory,
} = require("../../controllers/subcategory.controller");

router.route("/create-subcategory").post(createSubCategory);
router.route("/get-all-subcategories").get(getAllSubCategories);
router.route("/get-single-subcategory/:slug").get(getSingleSubCategory);
router.route("/update-subcategory/:slug").put(updateSubcategory);
router.route("/delete-subcategory/:slug").delete(deleteSubcategory);

module.exports = router;
