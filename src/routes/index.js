const express = require("express");
const router = express.Router();

router.use("/auth", require("./api/user.api"));
router.use("/category", require("./api/category.api"));
router.use("/subcategory", require("./api/subcategory.api"));

module.exports = router;
