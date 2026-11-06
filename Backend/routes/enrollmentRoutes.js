
import express from "express";

import {
  enrollCourse,
  getMyCourses,
  getMyEnrollmentRequests,
  getCourseStudents,
} from "../controllers/enrollmentController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// ================= Student =================

// Request Enrollment
router.post(
  "/",
  protect,
  authorizeRoles("student"),
  enrollCourse
);

// Approved Courses
router.get(
  "/mycourses",
  protect,
  authorizeRoles("student"),
  getMyCourses
);

// All Enrollment Requests
router.get(
  "/myrequests",
  protect,
  authorizeRoles("student"),
  getMyEnrollmentRequests
);

// ================= Mentor/Admin =================

// Students enrolled in a course
router.get(
  "/course/:courseId/students",
  protect,
  authorizeRoles("mentor", "admin"),
  getCourseStudents
);

export default router;
