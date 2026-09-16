import crypto from "crypto";

import razorpay from "../config/razorpay.js";
import Course from "../models/Course.js";
import Payment from "../models/Payment.js";
import Enrollment from "../models/Enrollment.js";

// ================= CREATE RAZORPAY ORDER =================

export const createPaymentOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check course ID
    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
      });
    }

    // Find course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Check existing enrollment
    const existingEnrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
    });

    // Already approved
    if (existingEnrollment?.status === "approved") {
      return res.status(400).json({
        message: "You are already enrolled in this course",
      });
    }

    // Check if a successful payment already exists
    const existingPaidPayment = await Payment.findOne({
      studentId: req.user._id,
      courseId,
      status: "paid",
    });

    if (existingPaidPayment) {
      return res.status(400).json({
        message: "Payment already completed. Waiting for admin approval.",
      });
    }

    // Convert rupees to paise
    const amount = Math.round(course.price * 100);

    if (amount <= 0) {
      return res.status(400).json({
        message: "Invalid course price",
      });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `enroll_${Date.now()}`,
      notes: {
        studentId: req.user._id.toString(),
        courseId: course._id.toString(),
      },
    });

    // Save payment record
    const payment = await Payment.create({
      studentId: req.user._id,
      courseId: course._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: "created",
    });

    return res.status(201).json({
      message: "Payment order created successfully",

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },

      paymentId: payment._id,

      course: {
        id: course._id,
        title: course.title,
        price: course.price,
      },

      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    return res.status(500).json({
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

// ================= VERIFY RAZORPAY PAYMENT =================

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Check required fields
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment verification details are missing",
      });
    }

    // Find our payment record
    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
      studentId: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    // Generate signature using Razorpay secret
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    // Compare signatures
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment signature verification failed",
      });
    }

    // Prevent duplicate verification
    if (payment.status === "paid") {
      return res.status(400).json({
        message: "Payment has already been verified",
      });
    }

    // Update payment
    payment.paymentId = razorpay_payment_id;
    payment.status = "paid";
    payment.paidAt = new Date();

    await payment.save();

    // Find existing enrollment
    let enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: payment.courseId,
    });

    if (enrollment) {
      // If rejected previously, allow resubmission
      enrollment.status = "pending";
      enrollment.requestedAt = new Date();
      enrollment.approvedAt = undefined;
      enrollment.approvedBy = undefined;
      enrollment.revokedAt = undefined;
      enrollment.revokedBy = undefined;

      await enrollment.save();
    } else {
      // Create new enrollment
      enrollment = await Enrollment.create({
        studentId: req.user._id,
        courseId: payment.courseId,
        status: "pending",
        requestedAt: new Date(),
      });
    }

    return res.status(200).json({
      message:
        "Payment verified successfully. Enrollment is pending admin approval.",

      payment: {
        id: payment._id,
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paidAt: payment.paidAt,
      },

      enrollment: {
        id: enrollment._id,
        status: enrollment.status,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      message: "Payment verification failed",
      error: error.message,
    });
  }
};