import express from "express";
import {
  createPost,
  getFeed,
  getSinglePost,
  updatePost,
  deletePost,
  likePost,
  bookmarkPost,
  sharePost,
  reportPost,
} from "../controllers/post.js";
import auth, { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, createPost);
router.get("/feed", optionalAuth, getFeed);
router.get("/:id", optionalAuth, getSinglePost);
router.patch("/update/:id", auth, updatePost);
router.delete("/delete/:id", auth, deletePost);
router.patch("/like/:id", auth, likePost);
router.patch("/bookmark/:id", auth, bookmarkPost);
router.post("/share/:id", auth, sharePost);
router.post("/report/:id", auth, reportPost);

export default router;
