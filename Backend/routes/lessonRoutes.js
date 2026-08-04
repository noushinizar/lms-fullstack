import express from "express";

import {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";

import protect from "../middleware/authMiddleware.js";

import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin", "mentor"), createLesson);

router.put("/:id", protect, authorizeRoles("admin", "mentor"), updateLesson);

router.delete("/:id", protect, authorizeRoles("admin", "mentor"), deleteLesson);

router.get("/single/:lessonId", protect, getLessonById);

router.get("/:courseId", protect, getLessons);

export default router;
