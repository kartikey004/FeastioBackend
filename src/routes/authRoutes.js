import express from "express";
import {
  googleAuth,
  loginUser,
  registerUser,
  refreshAccessToken,
} from "../controllers/authControllers.js";
// import {protect} from "../middlewares/protect.js"

const router = express.Router();

router.post("/google", googleAuth);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

export default router;
