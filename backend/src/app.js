import "dotenv/config"; 
import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import gameRoutes from "./routes/game.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import "./config/passport.js";
import passport from "passport";
import leaderboardRouter from "./routes/leaderboard.routes.js";

const app = express();

app.use(cors({
      origin:[process.env.FRONT_END_URL_1 , process.env.FRONT_END_URL_2 ],
    methods: ["GET", "POST"],
  }));
app.use(express.json());
app.use(morgan("dev"));


app.use(passport.initialize());


app.get("/", (req, res) => {
  res.json({ success: true, message: "API Running 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes );
app.use("/api/public",leaderboardRouter);

app.use(errorMiddleware);

export default app;
