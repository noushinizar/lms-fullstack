import express from "express";

import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getMentorCourses,
} from "../controllers/courseController.js";

import protect from "../middleware/authMiddleware.js";

import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), createCourse);

router.get("/", getCourses);

router.get("/my-courses", protect, authorizeRoles("mentor"), getMentorCourses);

router.get("/:id", protect, getCourseById);

router.put("/:id", protect, authorizeRoles("admin"), updateCourse);

router.delete("/:id", protect, authorizeRoles("admin"), deleteCourse);

export default router;
