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

const Role = model("roles", roleSchema);

module.exports = Role;
