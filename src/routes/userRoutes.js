import express from "express";
import {
  updateProfile,
  getUserProfile,
} from "../controllers/userControllers.js";
import { protect } from "../middlewares/protect.js";

const router = express.Router();

router.put("/updateprofile", protect, updateProfile);
router.get("/profile", protect, getUserProfile);

export default router;
