const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new Schema({
  role: {
    type: Schema.Types.ObjectId,
    ref: "userRoles",
    required: true,
  },
  avatar: {
    type: String,
  },
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Your name cannot exceed 30 characters"],
  },
  email: {
    type: String,
    required: [true, " Please enter your email"],
    unique: true,
  },
  email_verified_at: {
    type: Date,
  },
  phone_number: {
    type: String,
    validate: {
      validator: function (v) {
        return /\d{3}-\d{3}-\d{4}/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [8, "Your password must be longer that 8 characters."],
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  active: {
    type: Number,
    default: 1,
  },
  a_device_token: {
    type: String,
  },
  i_device_token: {
    type: String,
  },
  etc: {
    type: String,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpired_at: {
    type: Date,
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

//Encrypting password before saving user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//Encrypting password before updating user
userSchema.pre("findOneAndUpdate", async function (next) {
  this.set({ updated_at: new Date() });
});

//Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Return JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  //Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hash and set to resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //Set token expire time / 30 minutes
  this.resetPasswordExpired_at = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

// Get Role Name
userSchema.methods.getRoleName = function () {
  return this.role.name;
};

// Get Login Redirect URL
userSchema.methods.getRedirectURL = function () {
  return this.role.redirect_url;
};

const User = mongoose.model("users", userSchema);

const REF_NAME = {
  ROLE: "role",
};

module.exports = { User, REF_NAME };
