const express = require("express");
const Router = express.Router();

const expensesRoutes = require("./expensesRoute");

Router.use("/expenses", expensesRoutes);

module.exports = Router;
