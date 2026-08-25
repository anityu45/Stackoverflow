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

validateEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

// Serve static frontend assets from public directory if built
const publicDir = path.join(__dirname, "public");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

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

// SPA Catch-all middleware: serve index.html for UI pages in Express 5
app.use((req, res) => {
  const indexPath = path.join(publicDir, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send("Stackoverflow clone API is running. Run `npm run build` in backend to serve UI.");
  }
});

const PORT = config.port;
const databaseurl = config.mongoUri;

mongoose
  .connect(databaseurl)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });