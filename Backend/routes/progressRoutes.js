import express from "express";

import {
  markLessonComplete,
  getProgress,
} from "../controllers/progressController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/complete", protect, markLessonComplete);

router.get("/:courseId", protect, getProgress);

export default router;
