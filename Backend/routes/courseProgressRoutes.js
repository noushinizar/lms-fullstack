import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getCourseProgress,
} from "../controllers/courseProgressController.js";

const router = express.Router();

router.get(
  "/:courseId",
  protect,
  getCourseProgress
);

export default router;