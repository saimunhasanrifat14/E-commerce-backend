const express = require("express");
const router = express.Router();

router.use("/auth", require("./api/user.api"));
router.use("/category", require("./api/category.api"));

module.exports = router;
