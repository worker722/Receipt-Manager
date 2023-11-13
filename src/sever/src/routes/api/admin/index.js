const express = require("express");
const Router = express.Router();

const usersRoutes = require("./usersRoute");
const rolesRoutes = require("./rolesRoute");
const categoriesRoutes = require("./categoriesRoute");

Router.use("/users", usersRoutes);
Router.use("/roles", rolesRoutes);
Router.use("/category", categoriesRoutes);

module.exports = Router;
