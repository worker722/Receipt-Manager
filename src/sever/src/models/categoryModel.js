const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    default: 'public/assets/category_brand_default.png'
  },
  subname: {
    type: String,
    unique: true,
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

const Category = mongoose.model("categories", categorySchema);

const REF_NAME = {
  CATEGORY: "categories",
};

module.exports = { Category, REF_NAME };
