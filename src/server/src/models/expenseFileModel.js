const { Schema, model } = require("mongoose");

const expenseFileSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    unique: true,
    required: true,
  },
  etc: {
    type: String,
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
expenseFileSchema.pre("findOneAndUpdate", async function (next) {
  this.set({ updated_at: new Date() });
});

//Cannot be selected if deleted
expenseFileSchema.pre("find", async function (next) {
  this.where({ deleted_at: null });
});

const DB_COLLECTION_NAME = "expense_files";

const ExpenseFile = model(DB_COLLECTION_NAME, expenseFileSchema);

module.exports = { ExpenseFile, DB_COLLECTION_NAME };
