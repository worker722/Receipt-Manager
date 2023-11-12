const express = require("express");
const Router = express.Router();

const usersRoutes = require("./usersRoute");
const rolesRoutes = require("./rolesRoute");

Router.use("/users", usersRoutes);
Router.use("/roles", rolesRoutes);

module.exports = Router;
