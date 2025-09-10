import express from "express";
import {
  loginUser,
  registerUser,
  refreshAccessToken,
  logoutUser,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  resendPasswordResetOTP,
} from "../controllers/authControllers.js";
import { protect } from "../middlewares/protect.js";

const router = express.Router();

// router.post("/google", googleAuth);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", protect, logoutUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/resend-forgot-otp", resendPasswordResetOTP);

export default router;
