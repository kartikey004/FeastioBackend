import express from "express";
import {
  generateMealPlan,
  getMealPlans,
  getMealPlanById,
  deleteMealPlan,
} from "../controllers/mealPlanController.js";
import { protect } from "../middlewares/protect.js";
const router = express.Router();

router.post("/generate", protect, generateMealPlan);
router.get("/get", protect, getMealPlans);
router.get("/:id", protect, getMealPlanById);
router.delete("/:id", protect, deleteMealPlan);

export default router;
