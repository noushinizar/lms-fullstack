import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController.js";

const router = express.Router();

// Create Question
router.post(
  "/",
  protect,
  authorizeRoles("admin", "mentor"),
  createQuestion
);

// Get all questions of a quiz
router.get(
  "/quiz/:quizId",
  protect,
  getQuestions
);

// Get single question
router.get(
  "/:questionId",
  protect,
  getQuestionById
);

// Update question
router.put(
  "/:questionId",
  protect,
  authorizeRoles("admin", "mentor"),
  updateQuestion
);

// Delete question
router.delete(
  "/:questionId",
  protect,
  authorizeRoles("admin", "mentor"),
  deleteQuestion
);

export default router;