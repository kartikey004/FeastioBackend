import express from "express";
import { aiChat } from "../controllers/aiChatController.js";

const router = express.Router();

router.post("/", aiChat);

export default router;
