import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { gameEnd, gameStart, getPlayerStat } from "../controllers/game.controller.js";

const router = express.Router();

router.post("/start", authMiddleware, gameStart);
router.post("/end", authMiddleware, gameEnd);
router.get("/player-stats", authMiddleware, getPlayerStat);

export default router;
