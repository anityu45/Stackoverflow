import jwt from "jsonwebtoken";
import User from "../models/auth.js";
import { config } from "../config/env.js";

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decodedata = jwt.verify(token, config.jwtSecret);
    const userId = decodedata?.id;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const existingUser = await User.findById(userId).select("-password -resetOtp -languageOtp -loginSecurityOtp");
    if (!existingUser) {
      return res.status(401).json({ message: "User account not found" });
    }

    if (existingUser.status === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended by an administrator." });
    }

    req.userid = existingUser._id.toString();
    req.user = existingUser;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const decodedata = jwt.verify(token, config.jwtSecret);
      const userId = decodedata?.id;
      if (userId) {
        const existingUser = await User.findById(userId).select("-password");
        if (existingUser && existingUser.status !== "suspended") {
          req.userid = existingUser._id.toString();
          req.user = existingUser;
        }
      }
    }
  } catch (error) {
    // Ignore invalid token for optional auth routes
  }
  next();
};

export default auth;