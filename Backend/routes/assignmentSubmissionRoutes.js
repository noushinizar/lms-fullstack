import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import {
  submitAssignment,
  getMySubmissions,
  getAssignmentSubmissions,
  reviewSubmission,
  getMySubmission,
} from "../controllers/assignmentSubmissionController.js";
const router = express.Router();

/* ===========================
   Student Routes
=========================== */

// Submit Assignment
router.post(
  "/",
  protect,
  authorizeRoles("student"),
  submitAssignment
);

// Get My Submissions
router.get(
  "/my",
  protect,
  authorizeRoles("student"),
  getMySubmissions
);

/* ===========================
   Mentor/Admin Routes
=========================== */

// Get all submissions of an assignment
router.get(
  "/assignment/:assignmentId",
  protect,
  authorizeRoles("mentor", "admin"),
  getAssignmentSubmissions
);

// Review a submission
router.put(
  "/:id/review",
  protect,
  authorizeRoles("mentor", "admin"),
  reviewSubmission
);

router.get(
  "/my/:assignmentId",
  protect,
  authorizeRoles("student"),
  getMySubmission
);

export default router;