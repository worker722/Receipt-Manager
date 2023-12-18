const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DB_COLLECTION_NAME: CATEGORY } = require("./categoryModel");
const { DB_COLLECTION_NAME: EXPENSE } = require("./expenseModel");

const STATUS = {
  IN_PROGRESS: 0,
  PENDING: 1,
  APPROVED: 2,
  REFUNDED: 3,
  CLOSED: 4,
};

const receiptSchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: CATEGORY,
    required: true,
  },
  expense: {
    type: Schema.Types.ObjectId,
    ref: EXPENSE,
  },
  merchant_info: {
    type: String,
    required: true,
  },
  model_file: {
    type: String,
  },
  issued_at: {
    type: Date,
  },
  total_amount: {
    type: String,
  },
  vat_amount: {
    type: String,
  },
  amount_eur: {
    type: String,
  },
  currency: {
    type: String,
  },
  country_code: {
    type: String,
  },
  city: {
    type: String,
  },
  comment: {
    type: String,
  },
  status: {
    type: Number,
    require: true,
    default: STATUS.IN_PROGRESS,
  },
  image: {
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

//Set updated date before updating receipt
receiptSchema.pre("findOneAndUpdate", async function (next) {
  this.set({ updated_at: new Date() });
});

//Cannot be selected if deleted
receiptSchema.pre("find", async function (next) {
  this.where({ deleted_at: null });
});

const DB_COLLECTION_NAME = "receipts";

const Receipt = mongoose.model(DB_COLLECTION_NAME, receiptSchema);

const REF_NAME = {
  CATEGORY: "category",
  EXPENSE: "expense",
};

module.exports = { Receipt, DB_COLLECTION_NAME, REF_NAME, STATUS };
