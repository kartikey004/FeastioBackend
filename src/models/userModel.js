import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    authProvider: {
      type: String,
      enum: ["google", "facebook", "firebase", "local"],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    username: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      minlength: 3,
      maxlength: 20,
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    phoneNumber: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      match: [/^\+?[1-9]\d{9,14}$/, "Please enter a valid phone number"],
    },
    password: {
      type: String,
      select: false,
      required: function () {
        return this.authProvider === "local";
      },
    },
    profile: {
      dietaryRestrictions: { type: [String], default: [] },
      allergies: { type: [String], default: [] },
      healthGoals: { type: [String], default: [] },
      cuisinePreferences: { type: [String], default: [] },
    },
    profilePicture: { type: String },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

// Pre-save hook: hash password if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.authProvider === "local" && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// Remove password from output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model("User", userSchema);
