const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require("../../controllers/category.controller");
const { authGuard } = require("../../middleware/auth.guard.middleware");

router.route("/create-category").post(authGuard, createCategory);
router.route("/get-all-categories").get(getAllCategories);
router.route("/get-single-category/:slug").get(getSingleCategory);
router.route("/update-category/:slug").put(authGuard, updateCategory);
router.route("/delete-category/:slug").delete(authGuard, deleteCategory);

module.exports = router;
