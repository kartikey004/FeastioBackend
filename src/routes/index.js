import { Router } from "express";
import authRoutes from "./authRoutes.js";
import aiChatRoutes from "./aiChatRoutes.js";
import mealPlanRoutes from "./mealPlanRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "GeoNudge backend running" });
});

router.use("/auth", authRoutes);
router.use("/aiChat", aiChatRoutes);
router.use("/mealPlans", mealPlanRoutes);
router.use("/user", userRoutes);

export default router;
