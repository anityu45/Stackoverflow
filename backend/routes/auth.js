import express from "express";
import { Login, Signup, getallusers, updateprofile } from "../controllers/auth.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.get("/getalluser", getallusers);
router.get("/getallusers", getallusers);
router.patch("/update/:id", auth, updateprofile);

export default router;