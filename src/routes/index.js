const express = require("express");
const router = express.Router();

router.use("/auth", require("./api/user.api"));

module.exports = router;
