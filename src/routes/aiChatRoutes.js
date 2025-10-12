import express from "express";
import { aiChat, getChatHistory } from "../controllers/aiChatController.js";
import { protect } from "../middlewares/protect.js";

const router = express.Router();

router.post("/", protect, aiChat);
router.get("/history", protect, getChatHistory);

export default router;
