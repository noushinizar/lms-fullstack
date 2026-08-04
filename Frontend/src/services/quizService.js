import api from "./api";

// Create Quiz
export const createQuiz = async (quizData) => {
  const response = await api.post(
    "/quizzes",
    quizData
  );

  return response.data;
};

// Get all quizzes of a course
export const getQuizzes = async (courseId) => {
  const response = await api.get(
    `/quizzes/course/${courseId}`
  );

  return response.data;
};

// Get single quiz
export const getQuizById = async (quizId) => {
  const response = await api.get(
    `/quizzes/${quizId}`
  );

  return response.data;
};

// Update quiz
export const updateQuiz = async (
  quizId,
  quizData
) => {
  const response = await api.put(
    `/quizzes/${quizId}`,
    quizData
  );

  return response.data;
};

// Delete quiz
export const deleteQuiz = async (
  quizId
) => {
  const response = await api.delete(
    `/quizzes/${quizId}`
  );

  return response.data;
};

//submitquiz

export const submitQuiz = async (data) => {
  const response = await api.post("/quizzes/submit", data);
  return response.data;
};

export const getAttemptStatus = async (quizId) => {

  const response = await api.get(
    `/quizzes/${quizId}/attempt-status`
  );

  return response.data;
};