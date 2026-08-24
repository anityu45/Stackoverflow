import express from "express";
import { Askanswer, deleteanswer } from "../controllers/answer.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/postanswer/:id", auth, Askanswer);
router.delete("/delete/:id", auth, deleteanswer);
router.patch("/delete/:id", auth, deleteanswer);

export default router;