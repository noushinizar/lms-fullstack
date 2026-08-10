import Question from "../models/Question.js";
import Quiz from "../models/Quiz.js";
import Enrollment from "../models/Enrollment.js";

// ==========================================
// Create Question
// ==========================================

export const createQuestion = async (req, res) => {
  try {
    const question = await Question.create({
      quizId: req.body.quizId,
      question: req.body.question,
      options: req.body.options,
      correctAnswer: req.body.correctAnswer,
      marks: req.body.marks,
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// Get All Questions of a Quiz
// ==========================================

export const getQuestions = async (req, res) => {
  try {
    const quizId = req.params.quizId;

    // Check quiz exists
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found.",
      });
    }

    // ==========================================
    // Check course enrollment for students
    // ==========================================

    if (req.user.role === "student") {
      const enrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId: quiz.courseId,
        status: "approved",
      });

      if (!enrollment) {
        return res.status(403).json({
          message:
            "You are not approved to access this course.",
        });
      }
    }

    // ==========================================
    // Get questions
    // ==========================================

    const questions = await Question.find({
      quizId,
    })
      .select("-correctAnswer")
      .sort({ _id: 1 });

    res.json(questions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// Get Single Question
// ==========================================

export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(
      req.params.questionId
    );

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    // ==========================================
    // Check quiz exists
    // ==========================================

    const quiz = await Quiz.findById(question.quizId);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    // ==========================================
    // Check course enrollment for students
    // ==========================================

    if (req.user.role === "student") {
      const enrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId: quiz.courseId,
        status: "approved",
      });

      if (!enrollment) {
        return res.status(403).json({
          message:
            "You are not approved to access this course.",
        });
      }
    }

    // Never expose correctAnswer to students
    if (req.user.role === "student") {
      question.correctAnswer = undefined;
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// Update Question
// ==========================================

export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(
      req.params.questionId
    );

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    question.question = req.body.question;
    question.options = req.body.options;
    question.correctAnswer = req.body.correctAnswer;
    question.marks = req.body.marks;

    await question.save();

    res.json({
      message: "Question updated successfully.",
      question,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// Delete Question
// ==========================================

export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(
      req.params.questionId
    );

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    await question.deleteOne();

    res.json({
      message: "Question deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

