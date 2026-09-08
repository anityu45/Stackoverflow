import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { config, validateEnv } from "./config/env.js";
import userroutes from "./routes/auth.js";
import questionroute from "./routes/question.js";
import answerroutes from "./routes/answer.js";
import postroutes from "./routes/post.js";
import commentroutes from "./routes/comment.js";
import followroutes from "./routes/follow.js";
import notificationroutes from "./routes/notification.js";
import moderationroutes from "./routes/moderation.js";

validateEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "public");

const app = express();
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Allow requests from the deployed Vercel frontend, Render, and localhost
const allowedOrigins = [
  "https://stackoverflow-kappa-seven.vercel.app",
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server, same-origin)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serverless / persistent DB connection middleware
let isDbConnected = false;
const connectDB = async () => {
  if (isDbConnected || mongoose.connection.readyState === 1) {
    isDbConnected = true;
    return;
  }
  try {
    await mongoose.connect(config.mongoUri);
    isDbConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Serve static frontend assets if backend/public exists
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// API Routes
app.use("/user", userroutes);
app.use("/question", questionroute);
app.use("/answer", answerroutes);
app.use("/post", postroutes);
app.use("/comment", commentroutes);
app.use("/follow", followroutes);
app.use("/notification", notificationroutes);
app.use("/moderation", moderationroutes);

// Health check endpoint
app.get("/api-health", (req, res) => {
  res.json({
    status: "OK",
    message: "Stackoverflow clone API is running",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// SPA / Static page fallback handler
app.use((req, res) => {
  if (fs.existsSync(publicPath)) {
    // Check if a matching HTML file exists (e.g. /questions -> /questions.html)
    const cleanPath = req.path.replace(/\/$/, "");
    const pagePath = path.join(publicPath, `${cleanPath}.html`);
    if (fs.existsSync(pagePath)) {
      return res.sendFile(pagePath);
    }
    // Check index.html inside directory (e.g. /questions/index.html)
    const dirIndexPath = path.join(publicPath, cleanPath, "index.html");
    if (fs.existsSync(dirIndexPath)) {
      return res.sendFile(dirIndexPath);
    }
    // Fallback to main index.html
    const indexPath = path.join(publicPath, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// Start server
const PORT = config.port;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

export default app;