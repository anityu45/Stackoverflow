import Post from "../models/post.js";
import Follow from "../models/follow.js";
import Comment from "../models/comment.js";
import Notification from "../models/notification.js";
import { sendSuccess, sendError } from "../utils/response.js";

const parseHashtags = (content, providedTags = []) => {
  const matches = content.match(/#[\w-]+/g) || [];
  const extracted = matches.map((tag) => tag.replace("#", "").toLowerCase());
  const combined = [...new Set([...extracted, ...providedTags.map((t) => t.toLowerCase().trim())])];
  return combined.filter(Boolean);
};

export const createPost = async (req, res) => {
  try {
    const { content, postType, codeSnippet, imageUrl, tags } = req.body;
    if (!content || !content.trim()) {
      return sendError(res, 400, "Post content is required");
    }

    const processedTags = parseHashtags(content, Array.isArray(tags) ? tags : []);

    const post = await Post.create({
      user: req.userid,
      content: content.trim(),
      postType: postType || "technical_update",
      codeSnippet: codeSnippet || { code: "", language: "javascript" },
      imageUrl: imageUrl || "",
      tags: processedTags,
    });

    const populated = await post.populate("user", "name email reputation subscription role preferredLanguage");
    return sendSuccess(res, 201, "Post created successfully", populated);
  } catch (err) {
    console.error("Create post error:", err);
    return sendError(res, 500, "Failed to create post");
  }
};

export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || "all";
    const tag = req.query.tag;

    const query = {};

    if (tag) {
      query.tags = tag.toLowerCase().trim();
    }

    if (filter === "following" && req.userid) {
      const follows = await Follow.find({ follower: req.userid }).select("following");
      const followingUserIds = follows.map((f) => f.following);
      // Include user's own posts + followed users' posts
      query.user = { $in: [...followingUserIds, req.userid] };
    }

    let sort = { createdAt: -1 };
    if (filter === "trending") {
      sort = { engagementScore: -1, createdAt: -1 };
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("user", "name email reputation subscription role preferredLanguage");

    // Attach comment count to each post efficiently
    const postIds = posts.map((p) => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    commentCounts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const enrichedPosts = posts.map((p) => {
      const pObj = p.toObject();
      pObj.commentCount = countMap[p._id.toString()] || 0;
      pObj.isLiked = req.userid ? p.likes.some((id) => id.toString() === req.userid) : false;
      pObj.isBookmarked = req.userid ? p.bookmarks.some((id) => id.toString() === req.userid) : false;
      return pObj;
    });

    return sendSuccess(res, 200, "Feed retrieved successfully", enrichedPosts, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Get feed error:", err);
    return sendError(res, 500, "Failed to retrieve feed");
  }
};

export const getSinglePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate("user", "name email reputation subscription role preferredLanguage");

    if (!post) {
      return sendError(res, 404, "Post not found");
    }

    const commentCount = await Comment.countDocuments({ post: post._id });
    const pObj = post.toObject();
    pObj.commentCount = commentCount;
    pObj.isLiked = req.userid ? post.likes.some((id) => id.toString() === req.userid) : false;
    pObj.isBookmarked = req.userid ? post.bookmarks.some((id) => id.toString() === req.userid) : false;

    return sendSuccess(res, 200, "Post retrieved", pObj);
  } catch (err) {
    console.error("Get single post error:", err);
    return sendError(res, 500, "Failed to retrieve post");
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, postType, codeSnippet, imageUrl, tags } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return sendError(res, 404, "Post not found");
    }

    // Ownership check
    if (post.user.toString() !== req.userid) {
      return sendError(res, 403, "Unauthorized: You can only edit your own posts");
    }

    if (content) post.content = content.trim();
    if (postType) post.postType = postType;
    if (codeSnippet) post.codeSnippet = codeSnippet;
    if (imageUrl !== undefined) post.imageUrl = imageUrl;
    if (tags || content) post.tags = parseHashtags(post.content, Array.isArray(tags) ? tags : post.tags);

    await post.save();
    const updated = await post.populate("user", "name email reputation subscription role preferredLanguage");
    return sendSuccess(res, 200, "Post updated successfully", updated);
  } catch (err) {
    console.error("Update post error:", err);
    return sendError(res, 500, "Failed to update post");
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return sendError(res, 404, "Post not found");
    }

    // Server-side ownership check or admin check
    const isOwner = post.user.toString() === req.userid;
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, "Unauthorized: Only the owner or an admin can delete this post");
    }

    await Post.findByIdAndDelete(id);
    await Comment.deleteMany({ post: id });
    await Notification.deleteMany({ post: id });

    return sendSuccess(res, 200, "Post deleted successfully");
  } catch (err) {
    console.error("Delete post error:", err);
    return sendError(res, 500, "Failed to delete post");
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return sendError(res, 404, "Post not found");
    }

    const hasLiked = post.likes.some((userId) => userId.toString() === req.userid);

    if (hasLiked) {
      post.likes = post.likes.filter((userId) => userId.toString() !== req.userid);
    } else {
      post.likes.push(req.userid);

      // Trigger notification if liker is not post owner
      if (post.user.toString() !== req.userid) {
        await Notification.create({
          recipient: post.user,
          sender: req.userid,
          type: "like",
          post: post._id,
        });
      }
    }

    await post.save();
    return sendSuccess(res, 200, hasLiked ? "Unliked post" : "Liked post", {
      likesCount: post.likes.length,
      isLiked: !hasLiked,
    });
  } catch (err) {
    console.error("Like post error:", err);
    return sendError(res, 500, "Failed to update like status");
  }
};

export const bookmarkPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return sendError(res, 404, "Post not found");
    }

    const hasBookmarked = post.bookmarks.some((userId) => userId.toString() === req.userid);

    if (hasBookmarked) {
      post.bookmarks = post.bookmarks.filter((userId) => userId.toString() !== req.userid);
    } else {
      post.bookmarks.push(req.userid);
    }

    await post.save();
    return sendSuccess(res, 200, hasBookmarked ? "Removed from bookmarks" : "Bookmarked post", {
      isBookmarked: !hasBookmarked,
    });
  } catch (err) {
    console.error("Bookmark post error:", err);
    return sendError(res, 500, "Failed to update bookmark status");
  }
};

export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return sendError(res, 404, "Post not found");
    }

    post.shareCount += 1;
    await post.save();

    return sendSuccess(res, 200, "Post shared successfully", { shareCount: post.shareCount });
  } catch (err) {
    console.error("Share post error:", err);
    return sendError(res, 500, "Failed to share post");
  }
};

export const reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return sendError(res, 400, "Report reason is required");
    }

    const post = await Post.findById(id);
    if (!post) {
      return sendError(res, 404, "Post not found");
    }

    const alreadyReported = post.reports.some((r) => r.user.toString() === req.userid);
    if (alreadyReported) {
      return sendError(res, 400, "You have already reported this post");
    }

    post.reports.push({
      user: req.userid,
      reason: reason.trim(),
    });

    await post.save();
    return sendSuccess(res, 200, "Post reported to moderators for review");
  } catch (err) {
    console.error("Report post error:", err);
    return sendError(res, 500, "Failed to report post");
  }
};
