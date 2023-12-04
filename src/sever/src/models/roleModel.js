const { Schema, model } = require("mongoose");

const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  redirect_url: {
    type: String,
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

roleSchema.static("getRoleID", async function getRoleID(name = "user") {
  const role = await Role.findOne({ name });
  return role.get("_id");
});

//Set updated date before updating role
roleSchema.pre("findOneAndUpdate", async function (next) {
  this.set({ updated_at: new Date() });
});

//Cannot be selected if deleted
roleSchema.pre("find", async function (next) {
  this.where({ deleted_at: null });
});

const DB_COLLECTION_NAME = "roles";

const Role = model(DB_COLLECTION_NAME, roleSchema);

module.exports = Role;
