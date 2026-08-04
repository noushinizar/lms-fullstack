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
router.post("/", protect, enrollCourse);

// Approved Courses
router.get("/mycourses", protect, getMyCourses);

// All Enrollment Requests (Pending/Approved/Rejected)
router.get("/myrequests", protect, getMyEnrollmentRequests);

// ================= Mentor/Admin =================

// Students enrolled in a course
router.get(
  "/course/:courseId/students",
  protect,
  authorizeRoles("mentor", "admin"),
  getCourseStudents
);

export default router;