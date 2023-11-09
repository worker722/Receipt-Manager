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

roleSchema.static("seed", async function seed() {
  await Role.deleteMany({});

  Role.create([
    {
      name: "admin",
      value: 0,
      redirect_url: "dashboards/analytics",
    },
    {
      name: "staff",
      value: 1,
      redirect_url: "/",
    },
    {
      name: "user",
      value: 2,
      redirect_url: "/",
    },
  ]);
});

const Role = model("roles", roleSchema);

module.exports = Role;
