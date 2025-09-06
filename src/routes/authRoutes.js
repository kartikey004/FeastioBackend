import express from "express";
import {
  googleAuth,
  loginUser,
  registerUser,
  refreshAccessToken,
  logoutUser,
  verifyOTP,
  resendOTP,
} from "../controllers/authControllers.js";
import { protect } from "../middlewares/protect.js";

const router = express.Router();

router.post("/google", googleAuth);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", protect, logoutUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

export default router;
