const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DB_COLLECTION_NAME: RECEIPT } = require("./receiptModel");

const STATUS = {
  READ: 1,
  UNREAD: 0,
};

const commentSchema = new Schema({
  receipt: {
    type: Schema.Types.ObjectId,
    ref: RECEIPT,
  },
  message: {
    type: String,
  },
  status: {
    type: Number,
    defalt: STATUS.UNREAD,
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
commentSchema.pre("save", function (next) {});

//Set updated date before updating report
commentSchema.pre("findOneAndUpdate", async function (next) {
  this.set({ updated_at: new Date() });
});

//Cannot be selected if deleted
commentSchema.pre("find", async function (next) {
  this.where({ deleted_at: null });
});

const DB_COLLECTION_NAME = "comments";

const Report = mongoose.model(DB_COLLECTION_NAME, commentSchema);

module.exports = { Report, DB_COLLECTION_NAME, REF_NAME };
