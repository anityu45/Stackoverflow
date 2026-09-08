import Notification from "../models/notification.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getUserNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const total = await Notification.countDocuments({ recipient: req.userid });
    const unreadCount = await Notification.countDocuments({ recipient: req.userid, read: false });

    const notifications = await Notification.find({ recipient: req.userid })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "name email reputation subscription role preferredLanguage")
      .populate("post", "content postType")
      .populate("comment", "content");

    return sendSuccess(res, 200, "Notifications retrieved", notifications, {
      page,
      limit,
      total,
      unreadCount,
    });
  } catch (err) {
    console.error("Get notifications error:", err);
    return sendError(res, 500, "Failed to retrieve notifications");
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === "all") {
      await Notification.updateMany({ recipient: req.userid, read: false }, { $set: { read: true } });
      return sendSuccess(res, 200, "All notifications marked as read");
    }

    const notification = await Notification.findOne({ _id: id, recipient: req.userid });
    if (!notification) {
      return sendError(res, 404, "Notification not found");
    }

    notification.read = true;
    await notification.save();
    return sendSuccess(res, 200, "Notification marked as read");
  } catch (err) {
    console.error("Mark notification as read error:", err);
    return sendError(res, 500, "Failed to mark notification as read");
  }
};
