const { Schema, model } = require("mongoose");

const userRoleSchema = new Schema({
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

userRoleSchema.static("getRoleID", async function getRoleID(name = "user") {
  const role = await UserRole.findOne({ name });
  return role.get("_id");
});

userRoleSchema.static("seed", async function seed() {
  await UserRole.deleteMany({});

  UserRole.create([
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

const UserRole = model("userRoles", userRoleSchema);

module.exports = UserRole;
