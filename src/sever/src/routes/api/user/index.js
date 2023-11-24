const express = require("express");
const Router = express.Router();

const receiptRoutes = require("./receiptRoute");

Router.use("/receipts", receiptRoutes);

module.exports = Router;
