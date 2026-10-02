import express from "express";

import {
  registerUser,
  loginUser,
  getProfile,
  getMentors,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// AUTH
// ======================================================

router.post("/register", registerUser);

router.post("/login", loginUser);

// ======================================================
// PASSWORD RESET
// ======================================================

// Step 1: Send OTP
router.post("/forgot-password", forgotPassword);

// Step 2: Verify OTP
router.post("/verify-reset-otp", verifyResetOtp);

// Step 3: Reset password using temporary reset token
router.post("/reset-password", resetPassword);

// ======================================================
// PROTECTED ROUTES
// ======================================================

router.get("/profile", protect, getProfile);

router.get("/mentors", protect, getMentors);

export default router;