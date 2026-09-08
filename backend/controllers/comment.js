import Comment from "../models/comment.js";
import Post from "../models/post.js";
import Notification from "../models/notification.js";
import User from "../models/auth.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || !content.trim()) {
      return sendError(res, 400, "Comment content is required");
    }

    const post = await Post.findById(postId);
    if (!post) {
      return sendError(res, 404, "Post not found");
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return sendError(res, 404, "Parent comment not found");
      }
    }

    const comment = await Comment.create({
      post: postId,
      user: req.userid,
      content: content.trim(),
      parentComment: parentCommentId || null,
    });

    const populated = await comment.populate("user", "name email reputation subscription role preferredLanguage");

    // Send Notification to Post Owner (if not commenter)
    if (post.user.toString() !== req.userid && !parentCommentId) {
      await Notification.create({
        recipient: post.user,
        sender: req.userid,
        type: "comment",
        post: post._id,
        comment: comment._id,
      });
    }

    // Send Notification to Parent Comment Owner (if reply)
    if (parentComment && parentComment.user.toString() !== req.userid) {
      await Notification.create({
        recipient: parentComment.user,
        sender: req.userid,
        type: "reply",
        post: post._id,
        comment: comment._id,
      });
    }

    // Parse @mentions (e.g., @john)
    const mentionMatches = content.match(/@([\w.-]+)/g) || [];
    if (mentionMatches.length > 0) {
      const usernames = mentionMatches.map((m) => m.replace("@", "").trim());
      const mentionedUsers = await User.find({ name: { $in: usernames.map((u) => new RegExp(`^${u}$`, "i")) } });

      for (const mUser of mentionedUsers) {
        if (mUser._id.toString() !== req.userid) {
          await Notification.create({
            recipient: mUser._id,
            sender: req.userid,
            type: "mention",
            post: post._id,
            comment: comment._id,
          });
        }
      }
    }

    return sendSuccess(res, 201, "Comment added successfully", populated);
  } catch (err) {
    console.error("Add comment error:", err);
    return sendError(res, 500, "Failed to add comment");
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .populate("user", "name email reputation subscription role preferredLanguage");

    // Group into top-level comments and nested replies
    const commentMap = {};
    const topLevelComments = [];

    comments.forEach((c) => {
      const cObj = c.toObject();
      cObj.replies = [];
      commentMap[c._id.toString()] = cObj;
    });

    comments.forEach((c) => {
      const cObj = commentMap[c._id.toString()];
      if (c.parentComment) {
        const parent = commentMap[c.parentComment.toString()];
        if (parent) {
          parent.replies.push(cObj);
        } else {
          topLevelComments.push(cObj);
        }
      } else {
        topLevelComments.push(cObj);
      }
    });

    return sendSuccess(res, 200, "Comments retrieved successfully", topLevelComments);
  } catch (err) {
    console.error("Get comments error:", err);
    return sendError(res, 500, "Failed to retrieve comments");
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return sendError(res, 404, "Comment not found");
    }

    const post = await Post.findById(comment.post);

    const isCommentOwner = comment.user.toString() === req.userid;
    const isPostOwner = post && post.user.toString() === req.userid;
    const isAdmin = req.user?.role === "admin";

    if (!isCommentOwner && !isPostOwner && !isAdmin) {
      return sendError(res, 403, "Unauthorized: You cannot delete this comment");
    }

    await Comment.findByIdAndDelete(id);
    await Comment.deleteMany({ parentComment: id });
    await Notification.deleteMany({ comment: id });

    return sendSuccess(res, 200, "Comment deleted successfully");
  } catch (err) {
    console.error("Delete comment error:", err);
    return sendError(res, 500, "Failed to delete comment");
  }
};
