import express from "express";
import { updateProfile } from "../controllers/userControllers.js";
import { protect } from "../middlewares/protect.js";

const router = express.Router();

router.put("/updateprofile", protect, updateProfile);

export default router;
