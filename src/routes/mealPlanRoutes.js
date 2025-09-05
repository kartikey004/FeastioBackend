import express from "express";
import {
  generateMealPlan,
  getMealPlans,
  deleteMealPlan,
  updateMealPlan,
  getTodayMealPlan,
} from "../controllers/mealPlanController.js";
import { protect } from "../middlewares/protect.js";
const router = express.Router();

router.post("/generate", protect, generateMealPlan);
router.get("/get", protect, getMealPlans);
router.get("/getToday", protect, getTodayMealPlan);
router.patch("/update", protect, updateMealPlan);
router.delete("/:id", protect, deleteMealPlan);

export default router;
