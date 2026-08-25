import mongoose from "mongoose";

const userschema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  about: { type: String, default: "" },
  tags: { type: [String], default: [] },
  phone: { type: String, default: "" },
  joinDate: { type: Date, default: Date.now },

  // Role and Access Control
  role: { type: String, enum: ["user", "admin"], default: "user" },
  status: { type: String, enum: ["active", "suspended"], default: "active" },

  // Reputation & Rewards
  reputation: { type: Number, default: 0 },

  // Subscription Plan
  subscription: {
    plan: { type: String, enum: ["free", "bronze", "silver", "gold"], default: "free" },
    active: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },

  // Multilingual Preferences
  preferredLanguage: { type: String, default: "en" },

  // Password Reset / OTP tracking
  resetOtp: { type: String, default: null },
  resetOtpExpire: { type: Date, default: null },
  resetRequestCount: { type: Number, default: 0 },
  resetRequestDate: { type: Date, default: null },

  // Language Switching OTP
  languageOtp: { type: String, default: null },
  languageOtpExpire: { type: Date, default: null },

  // Device / Login Security OTP
  loginSecurityOtp: { type: String, default: null },
  loginSecurityOtpExpire: { type: Date, default: null },
});

// Indexes for optimal query performance
userschema.index({ email: 1 });
userschema.index({ role: 1 });
userschema.index({ status: 1 });

export default mongoose.model("user", userschema);
