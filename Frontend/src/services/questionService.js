import api from "./api";

// Get all questions of a quiz
export const getQuestions = async (quizId) => {
  const response = await api.get(`/questions/quiz/${quizId}`);
  return response.data;
};

// Get single question
export const getQuestionById = async (questionId) => {
  const response = await api.get(`/questions/${questionId}`);
  return response.data;
};

// Create question
export const createQuestion = async (questionData) => {
  const response = await api.post("/questions", questionData);
  return response.data;
};

// Update question
export const updateQuestion = async (questionId, questionData) => {
  const response = await api.put(
    `/questions/${questionId}`,
    questionData
  );
  return response.data;
};

// Delete question
export const deleteQuestion = async (questionId) => {
  const response = await api.delete(`/questions/${questionId}`);
  return response.data;
};