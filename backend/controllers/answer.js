import mongoose from "mongoose";
import question from "../models/question.js";

export const Askanswer = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "Question unavailable" });
  }
  const { answerbody, useranswered, userid } = req.body;

  if (!answerbody) {
    return res.status(400).json({ message: "Answer body cannot be empty" });
  }

  try {
    const targetQuestion = await question.findById(_id);
    if (!targetQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    targetQuestion.answer.push({
      answerbody,
      useranswered,
      userid,
      answeredon: new Date(),
    });
    targetQuestion.noofanswer = targetQuestion.answer.length;

    await targetQuestion.save();
    res.status(200).json({ data: targetQuestion });
  } catch (error) {
    console.error("Ask answer error:", error);
    res.status(500).json({ message: "Something went wrong posting answer." });
  }
};

export const deleteanswer = async (req, res) => {
  const { id: _id } = req.params;
  const answerid = req.body?.answerid || req.query?.answerid;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "Question unavailable" });
  }
  if (!answerid || !mongoose.Types.ObjectId.isValid(answerid)) {
    return res.status(400).json({ message: "Answer unavailable" });
  }

  try {
    const targetQuestion = await question.findById(_id);
    if (!targetQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    targetQuestion.answer = targetQuestion.answer.filter(
      (ans) => String(ans._id) !== String(answerid)
    );
    targetQuestion.noofanswer = targetQuestion.answer.length;

    await targetQuestion.save();
    res.status(200).json({ data: targetQuestion });
  } catch (error) {
    console.error("Delete answer error:", error);
    res.status(500).json({ message: "Something went wrong deleting answer." });
  }
};