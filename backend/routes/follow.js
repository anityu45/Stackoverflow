import express from "express";
import { toggleFollow, getFollowStatus, getFollowers, getFollowing } from "../controllers/follow.js";
import auth, { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/toggle/:targetUserId", auth, toggleFollow);
router.get("/status/:targetUserId", optionalAuth, getFollowStatus);
router.get("/followers/:userId", getFollowers);
router.get("/following/:userId", getFollowing);

export default router;
