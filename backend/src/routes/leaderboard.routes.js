import express from "express";
import { getLeaderboard,} from "../controllers/leaderboard.controller.js";

const leaderboardRouter = express.Router();

leaderboardRouter.get("/leaderboard", getLeaderboard);


export default leaderboardRouter;
