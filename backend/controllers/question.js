import mongoose from "mongoose";
import question from "../models/question.js";

export const Askquestion = async (req, res) => {
  const postquestiondata = req.body.postquestiondata || req.body;
  const postques = new question({ ...postquestiondata });
  try {
    await postques.save();
    res.status(200).json({ data: postques });
  } catch (error) {
    console.error("Ask question error:", error);
    res.status(500).json({ message: "Something went wrong posting question." });
  }
};

export const getallquestion = async (req, res) => {
  try {
    const allquestion = await question.find().sort({ askedon: -1 });
    res.status(200).json({ data: allquestion });
  } catch (error) {
    console.error("Get all questions error:", error);
    res.status(500).json({ message: "Something went wrong fetching questions." });
  }
};

export const getsinglequestion = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "Invalid question ID" });
  }
  try {
    const questionDoc = await question.findById(_id);
    if (!questionDoc) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ data: questionDoc });
  } catch (error) {
    console.error("Get single question error:", error);
    res.status(500).json({ message: "Something went wrong fetching question." });
  }
};

export const deletequestion = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "Question unavailable" });
  }
  try {
    await question.findByIdAndDelete(_id);
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({ message: "Something went wrong deleting question." });
  }
};

export const votequestion = async (req, res) => {
  const { id: _id } = req.params;
  const { value, userid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "Question unavailable" });
  }
  if (!userid) {
    return res.status(400).json({ message: "User ID is required to vote" });
  }
  try {
    const questionDoc = await question.findById(_id);
    if (!questionDoc) {
      return res.status(404).json({ message: "Question not found" });
    }

    const strUserid = String(userid);
    const upindex = questionDoc.upvote.findIndex((id) => id === strUserid);
    const downindex = questionDoc.downvote.findIndex((id) => id === strUserid);

    if (value === "upvote") {
      if (downindex !== -1) {
        questionDoc.downvote = questionDoc.downvote.filter((id) => id !== strUserid);
      }
      if (upindex === -1) {
        questionDoc.upvote.push(strUserid);
      } else {
        questionDoc.upvote = questionDoc.upvote.filter((id) => id !== strUserid);
      }
    } else if (value === "downvote") {
      if (upindex !== -1) {
        questionDoc.upvote = questionDoc.upvote.filter((id) => id !== strUserid);
      }
      if (downindex === -1) {
        questionDoc.downvote.push(strUserid);
      } else {
        questionDoc.downvote = questionDoc.downvote.filter((id) => id !== strUserid);
      }
    }

    await questionDoc.save();
    res.status(200).json({ data: questionDoc });
  } catch (error) {
    console.error("Vote question error:", error);
    res.status(500).json({ message: "Something went wrong voting." });
  }
};