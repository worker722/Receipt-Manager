const express = require("express");
const Router = express.Router();

const reportRoutes = require("./reportRoute");
const receiptRoutes = require("./receiptRoute");

Router.use("/reports", reportRoutes);
Router.use("/receipts", receiptRoutes);

module.exports = Router;
