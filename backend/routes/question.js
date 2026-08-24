import express from "express";
import {
  Askquestion,
  deletequestion,
  getallquestion,
  getsinglequestion,
  votequestion,
} from "../controllers/question.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/ask", auth, Askquestion);
router.get("/getallquestion", getallquestion);
router.get("/get/:id", getsinglequestion);
router.delete("/delete/:id", auth, deletequestion);
router.patch("/vote/:id", auth, votequestion);

export default router;