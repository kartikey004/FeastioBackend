import { MealPlan } from "../models/mealPlanModel.js";
import { getNutritionSummaryAndPlan } from "../services/nutritionAI.js";

// @desc    Generate a personalized meal plan using AI
// @route   POST /api/mealplan/generate
// @access  Private
export const generateMealPlan = async (req, res) => {
  console.log("📩 Hit /mealPlans/generate");
  try {
    const creatorId = req.user?._id; // from protect.js
    console.log("👤 User:", req.user);

    const {
      dietaryRestrictions,
      allergies,
      healthGoals,
      cuisinePreferences,
      name,
    } = req.body;

    console.log("⚙️ Preferences received:", {
      dietaryRestrictions,
      allergies,
      healthGoals,
      cuisinePreferences,
      name,
    });

    if (
      !dietaryRestrictions &&
      !allergies &&
      !healthGoals &&
      !cuisinePreferences
    ) {
      console.warn("⚠️ Missing personalization parameters");
      return res.status(400).json({
        success: false,
        message: "At least one personalization parameter is required",
      });
    }

    console.log("🤖 Calling nutrition AI service...");
    const aiResponse = await getNutritionSummaryAndPlan([
      {
        mealType: "Seed",
        recipeSnapshot: {
          title: "Custom meal based on preferences",
          ingredients: [
            ...(dietaryRestrictions || []),
            ...(allergies || []),
            ...(cuisinePreferences || []),
          ],
        },
      },
    ]);
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

/**
 * @desc    Get all meal plans for the logged-in user
 * @route   GET /api/mealPlans
 * @access  Private
 */
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
    const plans = await MealPlan.find({ creatorId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching meal plans",
    });
  }
};

/**
 * @desc    Get a single meal plan by ID
 * @route   GET /api/mealplan/:id
 * @access  Private
 */
export const getMealPlanById = async (req, res) => {
  console.log("📩 Hit /mealPlans/:id [GET]");
  try {
    const { id } = req.params;
    const creatorId = req.user?.id;
    console.log("🔍 Looking up plan:", { id, creatorId });

    const plan = await MealPlan.findOne({ _id: id, creatorId });
    if (!plan) {
      console.warn("⚠️ Meal Plan not found");
      return res.status(404).json({
        success: false,
        message: "Meal Plan not found",
      });
    }

    console.log("✅ Meal Plan found:", plan._id);
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error("❌ Error fetching meal plan:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching meal plan" });
  }
};

/**
 * @desc    Delete a meal plan by ID
 * @route   DELETE /api/mealplan/:id
 * @access  Private
 */
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
