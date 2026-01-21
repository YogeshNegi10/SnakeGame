import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

export const register = async (req, res, next) => {


  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    
    if (existing) {
      return next(new ApiError(400, "Email already registered"));
    }

    const user = await User.create({ username, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        },
        token
      
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(400, "Invalid credentials");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new ApiError(400, "Invalid credentials");

    const token = signToken(user._id);

    res.json({
      success: true,
      user: { id: user._id, username: user.username, email: user.email }, token }
    );
  } catch (err) {
    next(err);
  }
};

export const getUserProfile = (req, res) => {
  res.status(200).json({
    success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
      },
  });
};

