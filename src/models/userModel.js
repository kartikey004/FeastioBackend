import mongoose from "mongoose";

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
    },
    email: { type: String, required: true, unique: true },
    username: {
      type: String,
      required: function () {
        // Required for local signup; optional for OAuth
        return this.authProvider === "local";
      },
    },
    phoneNumber: {
      type: String,
      required: function () {
        // Required for local signup; optional for OAuth
        return this.authProvider === "local";
      },
    },
    password: {
      type: String,
      select: false,
      required: function () {
        // Only required for local users
        return this.authProvider === "local";
      },
    },

    profilePicture: { type: String },
    refreshToken: { type: String },

    alarmPreferences: {
      ringtone: { type: String, default: "default.mp3" },
      preAlerts: {
        type: [Number],
        default: [5, 10, 15],
        validate: {
          validator: function (arr) {
            return arr.every((num) => Number.isInteger(num) && num > 0);
          },
          message: "Pre-alerts must be positive integers",
        },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
