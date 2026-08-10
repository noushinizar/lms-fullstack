import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import checkEnrollment from "../middleware/enrollmentMiddleware.js";

import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignmentController.js";

const router = express.Router();

// Create Assignment
router.post(
  "/",
  protect,
  authorizeRoles("admin", "mentor"),
  createAssignment
);

// Get all assignments of a course
router.get(
  "/course/:courseId",
  protect,
  checkEnrollment,
  getAssignments
);

// Get single assignment
router.get(
  "/:assignmentId",
  protect,
  getAssignmentById
);

// Update assignment
router.put(
  "/:assignmentId",
  protect,
  authorizeRoles("admin", "mentor"),
  updateAssignment
);

// Delete assignment
router.delete(
  "/:assignmentId",
  protect,
  authorizeRoles("admin", "mentor"),
  deleteAssignment
);

export default router;