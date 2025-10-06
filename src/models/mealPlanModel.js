import mongoose from "mongoose";
const { Schema } = mongoose;
import { getDefaultMealTime } from "../utils/getMealTime.js";

const totalNutritionalSummarySchema = new Schema(
  {
    calories: { type: Number, min: 0, default: 0 },
    protein: { type: Number, min: 0, default: 0 },
    fat: { type: Number, min: 0, default: 0 },
    carbohydrates: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const recipeSnapshotSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    imageUrl: String,
    ingredients: [String],
    cookTime: Number,
    nutritionalInfo: {
      calories: { type: Number, min: 0, default: 0 },
      protein: { type: Number, min: 0, default: 0 },
      fat: { type: Number, min: 0, default: 0 },
      carbohydrates: { type: Number, min: 0, default: 0 },
    },
    cuisine: String,
  },
  { _id: false }
);

const mealSchema = new Schema(
  {
    mealType: {
      type: String,
      enum: ["Breakfast", "Lunch", "Snack", "Dinner"],
      required: true,
    },
    recipeSnapshot: {
      type: recipeSnapshotSchema,
    },
    mealTime: {
      type: String,
      required: true,
      default: function () {
        return getDefaultMealTime(this.mealType);
      },
      validate: {
        validator: function (v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid 24-hour time (HH:MM)`,
      },
    },
  },
  { _id: false }
);

const weeklyPlanSchema = new Schema(
  {
    Monday: [mealSchema],
    Tuesday: [mealSchema],
    Wednesday: [mealSchema],
    Thursday: [mealSchema],
    Friday: [mealSchema],
    Saturday: [mealSchema],
    Sunday: [mealSchema],
  },
  { _id: false }
);

const mealPlanSchema = new Schema(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    totalNutritionalSummary: {
      type: totalNutritionalSummarySchema,
      default: () => ({}),
    },
    plan: {
      type: weeklyPlanSchema,
      required: true,
      default: () => ({
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      }),
    },
  },
  { timestamps: true }
);

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);
export { MealPlan };
