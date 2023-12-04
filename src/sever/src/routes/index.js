const express = require("express");
const Router = express.Router();

// Authentication Routes
const authRoutes = require("./api/auth/authRoute");
const passwordRoutes = require("./api/auth/passwordRoute");
const accountRoutes = require("./api/account/accountRoute");
//
Router.use("/auth", authRoutes);
Router.use("/password", passwordRoutes);
Router.use("/account", accountRoutes);

// Role Routes
const adminRoutes = require("./api/admin");
const staffRoutes = require("./api/staff");
const userRoutes = require("./api/user");
//
Router.use("/admin", adminRoutes);
Router.use("/staff", staffRoutes);
Router.use("/user", userRoutes);

module.exports = Router;
