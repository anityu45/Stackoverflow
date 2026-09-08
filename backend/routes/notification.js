import express from "express";
import { getUserNotifications, markAsRead } from "../controllers/notification.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getUserNotifications);
router.patch("/read/:id", auth, markAsRead);

export default router;
