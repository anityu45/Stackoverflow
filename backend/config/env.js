import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/stackoverflow",
  jwtSecret: process.env.JWT_SECRET || "supersecretjwtkey12345",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  nodeEnv: process.env.NODE_ENV || "development",
};

export const validateEnv = () => {
  if (!process.env.JWT_SECRET) {
    console.warn("⚠️ Warning: JWT_SECRET environment variable is not defined. Using default fallback key for development.");
  }
  if (!process.env.MONGODB_URI && !process.env.MONGODB_URL) {
    console.warn("⚠️ Warning: MONGODB_URI/MONGODB_URL environment variable is not defined. Using local fallback URI.");
  }
};
