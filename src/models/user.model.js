const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { roles } = require("../utils/constants");

const { Schema } = mongoose;

const UserSchema = Schema({
  name: { type: String, unique: true },
  email: { type: String, required: true, index: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  role: {
    type: String,
    enum: [roles.admin, roles.FreeSubscriber],
    default: roles.FreeSubscriber,
  },
});

UserSchema.pre("save", async function (next) {
  //Check if password is not modified
  if (!this.isModified("password")) {
    return next();
  }

  //Encrypt the password
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    if (this.email == process.env.ADMIN_EMAIL.toLowerCase()) {
      this.role = roles.admin;
    }
    next();
  } catch (e) {
    return next(e);
  }
});

UserSchema.methods.isPasswordMatch = function (password, hashed, callback) {
  bcrypt.compare(password, hashed, (err, success) => {
    if (err) {
      return callback(err);
    }
    callback(null, success);
  });
};

UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
