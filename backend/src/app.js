import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import "./config/passport.js";
import passport from "passport";

const app = express();

app.use(cors({
    origin: "*", // for now (later we can restrict)
    methods: ["GET", "POST"],
  }));
app.use(express.json());
app.use(morgan("dev"));


app.use(passport.initialize());


app.get("/", (req, res) => {
  res.json({ success: true, message: "API Running 🚀" });
});

app.use("/api/auth", authRoutes);

app.use(errorMiddleware);

export default app;
