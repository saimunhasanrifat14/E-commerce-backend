const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { GlobalErrorHandler } = require("./utilities/GlobalErrorHandler");
const app = express();
const apiVersion = process.env.BASE_URL || "/api/v1";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// Routes
app.use(apiVersion, require("./routes/index"));

// Error hendling middleware
app.use(GlobalErrorHandler);

module.exports = app;
