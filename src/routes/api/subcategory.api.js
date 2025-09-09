const express = require("express");
const router = express.Router();
const {
  createSubCategory,
  getAllSubCategories,
  getSingleSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../../controllers/subcategory.controller");
const { authGuard } = require("../../middleware/auth.guard.middleware");

router.route("/create-subcategory").post(authGuard, createSubCategory);
router.route("/get-all-subcategories").get(getAllSubCategories);
router.route("/get-single-subcategory/:slug").get(getSingleSubCategory);
router.route("/update-subcategory/:slug").put(authGuard, updateSubCategory);
router.route("/delete-subcategory/:slug").delete(authGuard, deleteSubCategory);
module.exports = router;
