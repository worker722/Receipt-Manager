const { Schema, model } = require("mongoose");

const expenseSchema = new Schema({
  started_at: {
    type: Date,
  },
  ended_at: {
    type: Date,
  },
  amount: {
    type: String,
  },
  currency: {
    type: String,
  },
  location: {
    type: String,
  },
  company: {
    type: String,
  },
  merchant: {
    type: String,
  },
  etc: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  deleted_at: {
    type: Date,
  },
});

//Set updated date before updating expense
expenseSchema.pre("findOneAndUpdate", async function (next) {
  this.set({ updated_at: new Date() });
});

const Expense = model("expenses", expenseSchema);

module.exports = Expense;
