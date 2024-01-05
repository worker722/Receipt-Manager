const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    default: "public/assets/category_brand_default.png",
  },
  subname: {
    type: String,
    unique: true,
  },
  vat_possible: {
    type: Boolean,
    default: false,
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

//Set updated date before updating category
categorySchema.pre("findOneAndUpdate", async function (next) {
  this.set({ updated_at: new Date() });
});

//Cannot be selected if deleted
categorySchema.pre("find", async function (next) {
  this.where({ deleted_at: null });
});

const DB_COLLECTION_NAME = "categories";

const Category = mongoose.model(DB_COLLECTION_NAME, categorySchema);

module.exports = { Category, DB_COLLECTION_NAME };
