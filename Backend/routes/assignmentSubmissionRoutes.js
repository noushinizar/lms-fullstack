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

// Student
router.post(
  "/",
  protect,
  authorizeRoles("student"),
  submitAssignment
);

router.get(
  "/my",
  protect,
  authorizeRoles("student"),
  getMySubmissions
);

// Mentor/Admin
router.get(
  "/assignment/:assignmentId",
  protect,
  authorizeRoles("mentor", "admin"),
  getAssignmentSubmissions
);

router.put(
  "/:id/review",
  protect,
  authorizeRoles("mentor", "admin"),
  reviewSubmission
);

// Student - specific assignment
router.get(
  "/my/:assignmentId",
  protect,
  authorizeRoles("student"),
  getMySubmission
);

export default router;