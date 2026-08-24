import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey12345";

export const Signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exisitinguser = await user.findOne({ email });
    if (exisitinguser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashpassword = await bcrypt.hash(password, 12);
    const newuser = await user.create({
      name,
      email,
      password: hashpassword,
    });

    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ data: newuser, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Something went wrong during signup." });
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exisitinguser = await user.findOne({ email });
    if (!exisitinguser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const ispasswordcrct = await bcrypt.compare(
      password,
      exisitinguser.password
    );
    if (!ispasswordcrct) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: exisitinguser.email, id: exisitinguser._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ data: exisitinguser, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong during login." });
  }
};

export const getallusers = async (req, res) => {
  try {
    const alluser = await user.find().select("-password");
    res.status(200).json({ data: alluser });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Something went wrong fetching users." });
  }
};

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const editForm = req.body.editForm || req.body;
  const { name, about, tags } = editForm;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const updatedUser = await user.findByIdAndUpdate(
      _id,
      { $set: { name, about, tags } },
      { new: true }
    ).select("-password");

    res.status(200).json({ data: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Something went wrong updating profile." });
  }
};