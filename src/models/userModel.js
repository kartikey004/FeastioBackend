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
      // minlength: 5,
      // maxlength: 20,
      // match: [
      //   /^[a-zA-Z0-9_]+$/,
      //   "Username can only contain letters, numbers, and underscores",
      // ],
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
    otp: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },

    profile: {
      dietaryRestrictions: { type: [String], default: [] },
      allergies: { type: [String], default: [] },
      healthGoals: { type: [String], default: [] },
      cuisinePreferences: { type: [String], default: [] },

      gender: {
        type: String,
        enum: ["Male", "Female", "Other", "Prefer not to say"],
      },
      age: { type: Number, min: 1, max: 120 },
      height: { type: Number, min: 30, max: 300 }, // in cm
      weight: { type: Number, min: 1, max: 500 }, // in kg
      activityLevel: {
        type: String,
        enum: [
          "Sedentary",
          "Lightly Active",
          "Moderately Active",
          "Very Active",
          "Athlete",
        ],
      },
      healthConditions: { type: [String], default: [] },
      menstrualHealth: {
        type: String,
        enum: [
          "Regular cycle",
          "Irregular cycle",
          "PCOS",
          "Menopause / Perimenopause",
          "Prefer not to say",
          null,
        ],
      },
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
