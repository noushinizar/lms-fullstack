import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  hasAttemptedQuiz,
} from "../controllers/quizController.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin", "mentor"), createQuiz);

router.get("/course/:courseId", protect, getQuizzes);

router.get("/:quizId", protect, getQuizById);

router.put("/:quizId", protect, authorizeRoles("admin", "mentor"), updateQuiz);

router.delete(
  "/:quizId",
  protect,
  authorizeRoles("admin", "mentor"),
  deleteQuiz,
);
router.post(
  "/submit",
  protect,
  authorizeRoles("student"),
  submitQuiz
);
router.get(
  "/:quizId/attempt-status",
  protect,
  authorizeRoles("student"),
  hasAttemptedQuiz
);
export default router;
