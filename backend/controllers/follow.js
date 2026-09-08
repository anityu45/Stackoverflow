import Follow from "../models/follow.js";
import User from "../models/auth.js";
import Notification from "../models/notification.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const toggleFollow = async (req, res) => {
  try {
    const { targetUserId } = req.params;

    if (targetUserId === req.userid) {
      return sendError(res, 400, "You cannot follow yourself");
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return sendError(res, 404, "Target user not found");
    }

    const existingFollow = await Follow.findOne({ follower: req.userid, following: targetUserId });

    if (existingFollow) {
      await Follow.findByIdAndDelete(existingFollow._id);
      return sendSuccess(res, 200, `Unfollowed ${targetUser.name}`, { isFollowing: false });
    } else {
      await Follow.create({ follower: req.userid, following: targetUserId });

      // Trigger Notification
      await Notification.create({
        recipient: targetUserId,
        sender: req.userid,
        type: "follow",
      });

      return sendSuccess(res, 200, `Now following ${targetUser.name}`, { isFollowing: true });
    }
  } catch (err) {
    console.error("Toggle follow error:", err);
    return sendError(res, 500, "Failed to toggle follow status");
  }
};

export const getFollowStatus = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    if (!req.userid) {
      return sendSuccess(res, 200, "Follow status", { isFollowing: false });
    }

    const existing = await Follow.findOne({ follower: req.userid, following: targetUserId });
    return sendSuccess(res, 200, "Follow status", { isFollowing: !!existing });
  } catch (err) {
    console.error("Get follow status error:", err);
    return sendError(res, 500, "Failed to get follow status");
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.find({ following: userId }).populate("follower", "name email reputation subscription role preferredLanguage");
    const followers = follows.map((f) => f.follower);
    return sendSuccess(res, 200, "Followers retrieved", followers);
  } catch (err) {
    console.error("Get followers error:", err);
    return sendError(res, 500, "Failed to retrieve followers");
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.find({ follower: userId }).populate("following", "name email reputation subscription role preferredLanguage");
    const following = follows.map((f) => f.following);
    return sendSuccess(res, 200, "Following users retrieved", following);
  } catch (err) {
    console.error("Get following error:", err);
    return sendError(res, 500, "Failed to retrieve following users");
  }
};
