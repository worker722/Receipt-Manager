const express = require("express");
const Router = express.Router();

// Authentication Routes
const authRoutes = require("./api/auth/authRoute");
const passwordRoutes = require("./api/auth/passwordRoute");
const accountRoutes = require("./api/account/accountRoute");
// Use
Router.use("/auth", authRoutes);
Router.use("/password", passwordRoutes);
Router.use("/account", accountRoutes);

// Role Routes
const adminRoutes = require("./api/admin");
const staffRoutes = require("./api/staff");
// Use
Router.use("/admin", adminRoutes);
Router.use("/staff", staffRoutes);

module.exports = Router;
