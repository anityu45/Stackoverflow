import Post from "../models/post.js";
import User from "../models/auth.js";
import Comment from "../models/comment.js";
import Notification from "../models/notification.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { logSecurityEvent } from "../utils/logger.js";

export const getReportedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { "reports.0": { $exists: true } };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort({ "reports.length": -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email reputation subscription role status preferredLanguage")
      .populate("reports.user", "name email");

    return sendSuccess(res, 200, "Reported posts retrieved", posts, { page, limit, total });
  } catch (err) {
    console.error("Get reported posts error:", err);
    return sendError(res, 500, "Failed to retrieve reported posts");
  }
};

export const resolveReport = async (req, res) => {
  try {
    const { postId } = req.params;
    const { action } = req.body; // 'dismiss', 'delete_post', 'suspend_user'

    const post = await Post.findById(postId);
    if (!post) {
      return sendError(res, 404, "Post not found");
    }

    if (action === "dismiss") {
      post.reports = [];
      await post.save();
      logSecurityEvent({ event: "MODERATION_REPORT_DISMISSED", userId: req.userid, details: { postId } });
      return sendSuccess(res, 200, "Reports dismissed successfully");
    }

    if (action === "delete_post" || action === "suspend_user") {
      const offendingUserId = post.user;

      await Post.findByIdAndDelete(postId);
      await Comment.deleteMany({ post: postId });
      await Notification.deleteMany({ post: postId });

      if (action === "suspend_user" && offendingUserId) {
        await User.findByIdAndUpdate(offendingUserId, { $set: { status: "suspended" } });
        logSecurityEvent({
          event: "MODERATION_USER_SUSPENDED",
          userId: req.userid,
          severity: "WARN",
          details: { suspendedUser: offendingUserId, postId },
        });
      }

      logSecurityEvent({ event: "MODERATION_POST_REMOVED", userId: req.userid, details: { postId, action } });
      return sendSuccess(
        res,
        200,
        action === "suspend_user" ? "Post removed and user suspended" : "Post removed successfully"
      );
    }

    return sendError(res, 400, "Invalid moderation action");
  } catch (err) {
    console.error("Resolve report error:", err);
    return sendError(res, 500, "Failed to resolve report");
  }
};
