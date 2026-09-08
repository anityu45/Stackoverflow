import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    content: { type: String, required: true, trim: true },
    postType: {
      type: String,
      enum: ["technical_update", "code_snippet", "project_showcase", "learning_achievement"],
      default: "technical_update",
    },
    codeSnippet: {
      code: { type: String, default: "" },
      language: { type: String, default: "javascript" },
    },
    imageUrl: { type: String, default: "" },
    tags: [{ type: String, trim: true, lowercase: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    shareCount: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 },
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        reason: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Calculate engagement score before save
postSchema.pre("save", function (next) {
  const likesCount = this.likes ? this.likes.length : 0;
  const reportsCount = this.reports ? this.reports.length : 0;
  // engagement formula: (likes * 2) + (shares * 3) - (reports * 5)
  this.engagementScore = Math.max(0, likesCount * 2 + this.shareCount * 3 - reportsCount * 5);
  next();
});

postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ user: 1 });
postSchema.index({ engagementScore: -1 });

export default mongoose.model("Post", postSchema);
