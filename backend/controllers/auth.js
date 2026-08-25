import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

const sanitizeUser = (userDoc) => {
  const userObj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete userObj.password;
  delete userObj.resetOtp;
  delete userObj.resetOtpExpire;
  delete userObj.languageOtp;
  delete userObj.languageOtpExpire;
  delete userObj.loginSecurityOtp;
  delete userObj.loginSecurityOtpExpire;
  return userObj;
};

export const Signup = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existinguser = await user.findOne({ email: email.toLowerCase().trim() });
    if (existinguser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashpassword = await bcrypt.hash(password, 12);
    const newuser = await user.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashpassword,
      phone: phone ? phone.trim() : "",
    });

    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const safeUser = sanitizeUser(newuser);
    res.status(200).json({ data: safeUser, token });
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

    const existinguser = await user.findOne({ email: email.toLowerCase().trim() });
    if (!existinguser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    if (existinguser.status === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended by an administrator." });
    }

    const ispasswordcrct = await bcrypt.compare(
      password,
      existinguser.password
    );
    if (!ispasswordcrct) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: existinguser.email, id: existinguser._id },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const safeUser = sanitizeUser(existinguser);
    res.status(200).json({ data: safeUser, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong during login." });
  }
};

export const getallusers = async (req, res) => {
  try {
    const alluser = await user.find().select("-password -resetOtp -languageOtp -loginSecurityOtp");
    res.status(200).json({ data: alluser });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Something went wrong fetching users." });
  }
};

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const editForm = req.body.editForm || req.body;
  const { name, about, tags, phone } = editForm;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  // Ensure security: user can only edit their own profile unless admin
  if (req.userid !== _id && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized profile edit attempt" });
  }

  try {
    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (about !== undefined) updateFields.about = about;
    if (tags !== undefined) updateFields.tags = tags;
    if (phone !== undefined) updateFields.phone = phone;

    const updatedUser = await user.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { new: true }
    ).select("-password -resetOtp -languageOtp -loginSecurityOtp");

    res.status(200).json({ data: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Something went wrong updating profile." });
  }
};