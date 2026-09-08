import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import { config, validateEnv } from "./config/env.js";
import userroutes from "./routes/auth.js";
import questionroute from "./routes/question.js";
import answerroutes from "./routes/answer.js";

validateEnv();

const app = express();
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Allow requests from the deployed Vercel frontend (and localhost for dev)
const allowedOrigins = [
  process.env.FRONTEND_URL,          // e.g. https://your-app.vercel.app
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

// Serverless DB connection middleware
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

// API Routes
app.use("/user", userroutes);
app.use("/question", questionroute);
app.use("/answer", answerroutes);

// Health check endpoint
app.get("/api-health", (req, res) => {
  res.json({
    status: "OK",
    message: "Stackoverflow clone API is running",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// Start server (Render keeps the process alive; not serverless)
const PORT = config.port;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

export default app;