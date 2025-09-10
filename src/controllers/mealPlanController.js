import { MealPlan } from "../models/mealPlanModel.js";
import {
  getNutritionSummaryAndPlan,
  updateMealNutritionAndInfo,
} from "../services/nutritionAI.js";
import mongoose from "mongoose";

const getDefaultMealTime = (mealType) => {
  switch (mealType.toLowerCase()) {
    case "breakfast":
      return "08:00 AM";
    case "lunch":
      return "01:00 PM";
    case "snack":
      return "04:00 PM";
    case "dinner":
      return "08:00 PM";
    default:
      return "12:00 PM";
  }
};

export const generateMealPlan = async (req, res) => {
  console.log("📩 Hit /mealPlans/generate");
  try {
    const creatorId = req.user?._id; // from protect.js
    console.log("👤 User:", req.user);

    const {
      dietaryRestrictions = [],
      allergies = [],
      healthGoals = [],
      cuisinePreferences = [],
      gender,
      age,
      height,
      weight,
      activityLevel,
      healthConditions = [],
      menstrualHealth,
      name,
    } = req.body;

    console.log("⚙️ Profile received:", req.body);

    // Validate
    if (
      !dietaryRestrictions.length &&
      !allergies.length &&
      !healthGoals.length &&
      !cuisinePreferences.length
    ) {
      console.warn("⚠️ Missing personalization parameters");
      return res.status(400).json({
        success: false,
        message: "At least one personalization parameter is required",
      });
    }

    // ✅ Pass full profile info to AI
    console.log("🤖 Calling nutrition AI service with full profile...");
    const aiResponse = await getNutritionSummaryAndPlan({
      profile: {
        gender,
        age,
        height,
        weight,
        activityLevel,
        healthConditions,
        menstrualHealth,
        dietaryRestrictions,
        allergies,
        healthGoals,
        cuisinePreferences,
      },
      seedMeals: [
        {
          mealType: "Seed",
          recipeSnapshot: {
            title: "Custom meal based on user profile",
          },
        },
      ],
    });

    console.log("✅ AI response received:", aiResponse);

    // 2. Normalize plan
    const normalizedPlan = {};
    for (const day of Object.keys(aiResponse.plan)) {
      console.log(`📅 Normalizing plan for day: ${day}`);
      normalizedPlan[day] = aiResponse.plan[day].map((meal) => ({
        mealType: meal.mealType,
        recipeSnapshot: {
          title: meal.recipeSnapshot.title,
          description: meal.recipeSnapshot.description || "",
          imageUrl: meal.recipeSnapshot.imageUrl || "",
          ingredients: meal.recipeSnapshot.ingredients || [],
          cookTime: meal.recipeSnapshot.cookTime || 0,
          nutritionalInfo: meal.recipeSnapshot.nutritionalInfo || {
            calories: 0,
            protein: 0,
            fat: 0,
            carbohydrates: 0,
          },
          cuisine: meal.recipeSnapshot.cuisine || "General",
        },
      }));
    }

    console.log("📦 Normalized plan ready:", normalizedPlan);

    // 3. Save generated plan in DB
    const newPlan = new MealPlan({
      creatorId,
      name: name || `${req.user.name || "User"}'s Personalized Plan`,
      totalNutritionalSummary: aiResponse.totalNutritionalSummary,
      plan: normalizedPlan,
      profile: {
        gender,
        age,
        height,
        weight,
        activityLevel,
        healthConditions,
        menstrualHealth,
        dietaryRestrictions,
        allergies,
        healthGoals,
        cuisinePreferences,
      },
    });

    console.log("💾 Saving new plan to DB...");
    await newPlan.save();
    console.log("✅ Meal plan saved:", newPlan._id);

    // 4. Return generated plan
    res.status(201).json({
      success: true,
      message: "Meal Plan generated successfully",
      data: newPlan,
    });
  } catch (error) {
    console.error("❌ Error generating meal plan:", error);
    res.status(500).json({
      success: false,
      message: "Server error while generating meal plan",
      error: error.message,
    });
  }
};

export const getMealPlans = async (req, res) => {
  try {
    const creatorId = req.user?.id; // from auth middleware

    if (!creatorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID found",
      });
    }

    // fetch all meal plans for this user
    const plans = await MealPlan.findOne({ creatorId }).sort({ createdAt: -1 });

    if (!plans) {
      return res.status(404).json({
        success: false,
        message: "No meal plan found",
      });
    }

    res.status(200).json({
      success: true,
      data: plans ? [plans] : [],
    });
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching meal plans",
    });
  }
};

export const updateMealPlan = async (req, res) => {
  try {
    const creatorId = req.user?._id;
    if (!creatorId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No user ID found" });
    }

    const { day, newMeal } = req.body;
    if (!day || !newMeal?.mealType) {
      return res
        .status(400)
        .json({ message: "day and newMeal.mealType are required" });
    }

    const mealPlan = await MealPlan.findOne({ creatorId });
    if (!mealPlan)
      return res.status(404).json({ message: "Meal plan not found" });

    // Initialize recipeSnapshot if missing
    newMeal.recipeSnapshot = newMeal.recipeSnapshot || {
      title: newMeal.title || "",
      description: newMeal.description || "",
    };

    // Fetch AI nutrition and info
    const aiData = await updateMealNutritionAndInfo(newMeal.recipeSnapshot);
    if (aiData) {
      newMeal.recipeSnapshot.nutritionalInfo = aiData.nutritionalInfo || {};
      newMeal.recipeSnapshot.cookTime = aiData.cookTime || 0;
      newMeal.recipeSnapshot.ingredients = aiData.ingredients || [];
      newMeal.recipeSnapshot.cuisine = aiData.cuisine || "Unknown";
    }

    // Ensure day exists in plan
    mealPlan.plan[day] = mealPlan.plan[day] || [];

    // Update or add meal
    const mealIndex = mealPlan.plan[day].findIndex(
      (meal) => meal.mealType === newMeal.mealType
    );
    if (mealIndex === -1) mealPlan.plan[day].push(newMeal);
    else mealPlan.plan[day][mealIndex] = newMeal;

    // Update total nutritional summary
    const summary = { calories: 0, protein: 0, fat: 0, carbohydrates: 0 };
    Object.values(mealPlan.plan).forEach((meals) => {
      if (Array.isArray(meals)) {
        meals.forEach((m) => {
          const nut = m.recipeSnapshot?.nutritionalInfo || {};
          summary.calories += nut.calories || 0;
          summary.protein += nut.protein || 0;
          summary.fat += nut.fat || 0;
          summary.carbohydrates += nut.carbohydrates || 0;
        });
      }
    });
    mealPlan.totalNutritionalSummary = summary;

    await mealPlan.save();

    console.log("Meal plan updated successfully for:", day, newMeal.mealType);

    res.json({ message: `${day} - ${newMeal.mealType} updated successfully!` });
  } catch (error) {
    console.error("Error updating meal plan:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      validationErrors: error.errors ? Object.keys(error.errors) : null,
    });
  }
};

export const deleteMealPlan = async (req, res) => {
  console.log("📩 Hit /mealPlans/:id [DELETE]");
  try {
    const { id } = req.params;
    const creatorId = req.user?.id;
    console.log("🗑️ Deleting plan:", { id, creatorId });

    const deletedPlan = await MealPlan.findOneAndDelete({ _id: id, creatorId });
    if (!deletedPlan) {
      console.warn("⚠️ Meal Plan not found or unauthorized");
      return res.status(404).json({
        success: false,
        message: "Meal Plan not found or not authorized to delete",
      });
    }

    console.log("✅ Meal Plan deleted:", deletedPlan._id);
    res.json({ success: true, message: "Meal Plan deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting meal plan:", error);
    res
      .status(500)
      .json({ success: false, message: "Error deleting meal plan" });
  }
};

export const getTodayMealPlan = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const today = new Date();
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDay = dayNames[today.getDay()];

    const mealPlan = await MealPlan.findOne({
      creatorId: userId,
    });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "No meal plan found for user.",
        data: null,
      });
    }

    const todayMeals = mealPlan.plan[currentDay] || [];

    const mealData = {
      breakfast: null,
      lunch: null,
      snack: null,
      dinner: null,
    };

    todayMeals.forEach((meal) => {
      const mealType = meal.mealType.toLowerCase();
      if (mealData.hasOwnProperty(mealType)) {
        mealData[mealType] = {
          name: meal.recipeSnapshot?.title || `${meal.mealType} Meal`,
          description: meal.recipeSnapshot?.description || "",
          calories: meal.recipeSnapshot?.nutritionalInfo?.calories || 0,
          protein: meal.recipeSnapshot?.nutritionalInfo?.protein || 0,
          fat: meal.recipeSnapshot?.nutritionalInfo?.fat || 0,
          carbohydrates:
            meal.recipeSnapshot?.nutritionalInfo?.carbohydrates || 0,
          imageUrl: meal.recipeSnapshot?.imageUrl || null,
          ingredients: meal.recipeSnapshot?.ingredients || [],
          cookTime: meal.recipeSnapshot?.cookTime || null,
          cuisine: meal.recipeSnapshot?.cuisine || null,
          completed: false,
          scheduledTime: getDefaultMealTime(meal.mealType),
        };
      }
    });

    const totalCalories = Object.values(mealData)
      .filter((meal) => meal != null)
      .reduce((total, meal) => total + meal.calories, 0);

    const dailyNutritionalSummary = todayMeals.reduce(
      (acc, meal) => {
        const info = meal.recipeSnapshot?.nutritionalInfo || {};
        acc.calories += info.calories || 0;
        acc.protein += info.protein || 0;
        acc.fat += info.fat || 0;
        acc.carbohydrates += info.carbohydrates || 0;
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbohydrates: 0 }
    );

    const response = {
      success: true,
      message: "Today's meal plan retrieved successfully",
      data: {
        date: today.toISOString().split("T")[0], // YYYY-MM-DD format
        dayName: currentDay,
        mealPlanId: mealPlan._id,
        mealPlanName: mealPlan.name,
        totalCalories,
        dailyNutritionalSummary,
        meals: mealData,
        meta: {
          totalMealsPlanned: todayMeals.length,
          availableMealTypes: Object.keys(mealData).filter(
            (key) => mealData[key] !== null
          ),
        },
      },
    };

    console.log("Today's meal plan:", response);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching today's meal plan:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching meal plan",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
