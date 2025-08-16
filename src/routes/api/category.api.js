const express = require("express");
const router = express.Router();
const categoryController = require("../../controller/category.controller");
const { authGuard } = require("../../middleware/authGuard.middleware");

router.route("/create-category").post(authGuard, categoryController.createCategory);

module.exports = router;
