import mongoose from "mongoose";

const trainAlarmSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Scheme.Types.ObjectId,
      ref: "User",
      required: true,
    },

    trainName: { type: String, required: true },
    trainNumber: { type: String },

    boardingStation: { type: String, required: true },
    destinationStation: { type: String, required: true },

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

    selectedRingtone: {
      type: String,
      default: "default.mp3",
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },

    scheduledArrivalTime: { type: Date },
  },
  { timestamps: true }
);
