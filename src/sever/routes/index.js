const express = require("express");
const Router = express.Router();

const authRoutes = require("./api/auth/authRoute");
const passwordRoutes = require("./api/auth/passwordRoute");
const accountRoutes = require("./api/account/accountRoute");

// Role Routes
const adminRoutes = require("./api/admin");


// Specific routes
Router.use("/auth", authRoutes);
Router.use("/password", passwordRoutes);
Router.use("/account", accountRoutes);

Router.use("/admin", adminRoutes);

module.exports = Router;
