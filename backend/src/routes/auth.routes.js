import express from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getUserProfile } from "../controllers/auth.controller.js";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
  "/register",
  [
    body("username").trim().notEmpty().withMessage("username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be 6+ chars")
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  login
);

router.get(
  "/userProfile",
  authMiddleware,
  getUserProfile
);


// STEP 1: Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// STEP 2: Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // redirect to frontend with token
    res.redirect(
      `https://snake-game-tan-tau.vercel.app?token=${token}`
    );
  }
);



export default router;
