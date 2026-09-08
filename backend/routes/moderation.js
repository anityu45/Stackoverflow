import express from "express";
import { getReportedPosts, resolveReport } from "../controllers/moderation.js";
import auth from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

router.get("/reports", auth, requireAdmin, getReportedPosts);
router.post("/resolve/:postId", auth, requireAdmin, resolveReport);

export default router;
