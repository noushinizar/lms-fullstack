import express from "express";

import {
  createLiveClass,
  getMyLiveClasses,
  getAllLiveClasses,
  getStudentLiveClasses,
  updateLiveClass,
  deleteLiveClass,
} from "../controllers/liveClassController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();


// =====================================================
// MENTOR ROUTES
// =====================================================

// Create live class
// POST /api/live-classes
router.post(
  "/",
  protect,
  authorizeRoles("mentor", "admin"),
  createLiveClass
);


// Get mentor's own live classes
// GET /api/live-classes/my
router.get(
  "/my",
  protect,
  authorizeRoles("mentor"),
  getMyLiveClasses
);


// Update live class
// PUT /api/live-classes/:id
router.put(
  "/:id",
  protect,
  authorizeRoles("mentor"),
  updateLiveClass
);


// Delete live class
// DELETE /api/live-classes/:id
router.delete(
  "/:id",
  protect,
  authorizeRoles("mentor"),
  deleteLiveClass
);


// =====================================================
// STUDENT ROUTES
// =====================================================

// Get live classes from student's approved courses
// GET /api/live-classes/student
router.get(
  "/student",
  protect,
  authorizeRoles("student"),
  getStudentLiveClasses
);


// =====================================================
// ADMIN ROUTES
// =====================================================

// Get all live classes
// GET /api/live-classes/admin
router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  getAllLiveClasses
);


export default router;