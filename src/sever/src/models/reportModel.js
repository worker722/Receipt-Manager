const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DB_COLLECTION_NAME: EXPENSE } = require("./expenseModel");
const { DB_COLLECTION_NAME: RECEIPT } = require("./receiptModel");

const STATUS = {
  IN_PROGRESS: 0,
  IN_REVIEW: 1,
  ACCEPTED: 2,
  REJECTED: 3,
  CLOSED: 4,
};

const reportSchema = new Schema({
  public_id: {
    type: Number,
    unique: true,
  },
  receipt_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: RECEIPT,
    },
  ],
  expense_ids: [
    {
      type: Schema.Types.ObjectId,
      ref: EXPENSE,
    },
  ],
  status: {
    type: Number,
    require: true,
    default: STATUS.IN_PROGRESS,
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

// When saving increase public_id value automatically
reportSchema.pre("save", function (next) {
  Report.find({})
    .count()
    .exec()
    .then((count) => {
      if (count > 0) {
        Report.findOne({})
          .sort({ public_id: -1 })
          .exec()
          .then((maxReport) => {
            this.public_id = maxReport.public_id + 1;
            next();
          });
      } else {
        this.public_id = 1;
        next();
      }
    });
});

//Set updated date before updating report
reportSchema.pre("findOneAndUpdate", async function (next) {
  this.set({ updated_at: new Date() });
});

//Cannot be selected if deleted
reportSchema.pre("find", async function (next) {
  this.where({ deleted_at: null });
});

const DB_COLLECTION_NAME = "reports";

const Report = mongoose.model(DB_COLLECTION_NAME, reportSchema);

const REF_NAME = {
  RECEIPT_IDS: "receipt_ids",
  EXPENSE_IDS: "expense_ids",
};

module.exports = { Report, DB_COLLECTION_NAME, STATUS, REF_NAME };
