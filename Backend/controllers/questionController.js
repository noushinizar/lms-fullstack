import Question from "../models/Question.js";

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

export const getQuestions = async (req, res) => {

  try {

    const questions = await Question.find({
      quizId: req.params.quizId,
    });

    res.json(questions);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

export const getQuestionById = async (req, res) => {

  try {

    const question = await Question.findById(req.params.questionId);

    if (!question) {

      return res.status(404).json({
        message: "Question not found",
      });

    }

    res.json(question);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

export const updateQuestion = async (req, res) => {

  try {

    const question = await Question.findById(req.params.questionId);

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

export const deleteQuestion = async (req, res) => {

  try {

    const question = await Question.findById(req.params.questionId);

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