import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import QuizResult from "../models/QuizResult.js";
import { updateCourseProgress } from "../services/progress/progressService.js";
// Create Quiz
export const createQuiz = async (req, res) => {
  try {
     console.log("BODY:",req.body);
   console.log("USER:",req.user);
   const quiz = await Quiz.create({
  courseId: req.body.courseId,
  title: req.body.title,
  description: req.body.description,
  duration: req.body.duration,
  dueDate: req.body.dueDate,
});

    res.status(201).json(quiz);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// Get all quizzes of a course
export const getQuizzes = async (req, res) => {

  try {

    const quizzes = await Quiz.find({
      courseId: req.params.courseId,
    }).sort({ createdAt: -1 });

    res.json(quizzes);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

// Get single quiz
export const getQuizById = async (req, res) => {

  try {

    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    res.json(quiz);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

// Update Quiz
export const updateQuiz = async (req, res) => {

  try {

    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    quiz.title = req.body.title;
    quiz.description = req.body.description;
    quiz.duration = req.body.duration;
    quiz.dueDate = req.body.dueDate;
    
    await quiz.save();

    res.json({
      message: "Quiz updated successfully.",
      quiz,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

// Delete Quiz
export const deleteQuiz = async (req, res) => {

  try {

    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    await quiz.deleteOne();

    res.json({
      message: "Quiz deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

//submitquiz

export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
     const alreadySubmitted = await QuizResult.findOne({
  quizId,
  studentId: req.user._id,
});

if (alreadySubmitted) {
  return res.status(400).json({
    message: "You have already attempted this quiz.",
  });
}


    // Get all questions of this quiz
    const questions = await Question.find({ quizId });

    let score = 0;
    let correctAnswers = 0;

    questions.forEach((question) => {
      if (answers[question._id] === question.correctAnswer) {
        score += question.marks;
        correctAnswers++;
      }
    });

    const totalMarks = questions.reduce(
      (sum, question) => sum + question.marks,
      0
    );

    const totalQuestions = questions.length;

    const wrongAnswers = totalQuestions - correctAnswers;

    const percentage = Math.round((score / totalMarks) * 100);

    const status = percentage >= 40 ? "PASS" : "FAIL";

    // Save quiz result
    const result = await QuizResult.create({
      quizId,
      studentId: req.user._id,
      score,
      totalQuestions,
    });
      const quiz = await Quiz.findById(quizId);

await updateCourseProgress(
    req.user._id,
    quiz.courseId
);
    res.json({
      message: "Quiz submitted successfully.",

      // Marks
      score,
      totalMarks,

      // Questions
      totalQuestions,
      correctAnswers,
      wrongAnswers,

      // Performance
      percentage,
      status,

      // Saved Result
      result,
    });
  

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



export const hasAttemptedQuiz = async (req, res) => {

  try {

    const result = await QuizResult.findOne({
      quizId: req.params.quizId,
      studentId: req.user._id,
    });

    res.json({
      attempted: !!result,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};