const express = require("express");
const Router = express.Router();

const expensesRoutes = require("./expensesRoute");
const reportRoutes = require("./reportRoute");
const receiptRoutes = require("./receiptRoute");

Router.use("/reports", reportRoutes);
Router.use("/receipts", receiptRoutes);
Router.use("/expenses", expensesRoutes);

module.exports = Router;
