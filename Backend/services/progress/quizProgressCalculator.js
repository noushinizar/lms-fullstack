import Quiz from "../../models/Quiz.js";
import QuizResult from "../../models/QuizResult.js";

export const calculateQuizProgress = async (
  studentId,
  courseId
) => {
  const quizzes = await Quiz.find({
    courseId,
  }).select("_id");

  const quizIds = quizzes.map((q) => q._id);

  const totalQuizzes = quizIds.length;

  const completedQuizIds = await QuizResult.distinct(
    "quizId",
    {
      studentId,
      quizId: {
        $in: quizIds,
      },
    }
  );

  return {
    totalQuizzes,
    quizzesCompleted: completedQuizIds.length,
  };
};