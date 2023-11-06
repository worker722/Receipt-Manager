const express = require("express");
const Router = express.Router();

const usersRoutes = require("./usersRoute");

Router.use("/users", usersRoutes);

module.exports = Router;
