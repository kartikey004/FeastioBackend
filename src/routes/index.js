import { Router } from "express";
import authRoutes from "./authRoutes.js";
import aiChatRoutes from "./aiChatRoutes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "GeoNudge backend running" });
});

router.use("/auth", authRoutes);
router.use("/aiChat", aiChatRoutes);

export default router;
