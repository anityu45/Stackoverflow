import express from "express";
import { addComment, getPostComments, deleteComment } from "../controllers/comment.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/post/:postId", auth, addComment);
router.get("/post/:postId", getPostComments);
router.delete("/delete/:id", auth, deleteComment);

export default router;
