import express from "express";

import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/paymentController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// ================= Student =================

// Create Razorpay payment order
router.post(
  "/create-order",
  protect,
  authorizeRoles("student"),
  createPaymentOrder
);

export default router;

// Verify Razorpay payment
router.post(
  "/verify",
  protect,
  authorizeRoles("student"),
  verifyPayment
);