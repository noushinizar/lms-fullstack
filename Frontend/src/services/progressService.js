import api from "./api";

// Mark a lesson as completed
export const markLessonComplete = async (courseId, lessonId) => {
  const response = await api.post("/progress/complete", {
    courseId,
    lessonId,
  });

  return response.data;
};

// Get progress of a course
export const getProgress = async (courseId) => {
  const response = await api.get(`/progress/${courseId}`);

  return response.data;
};