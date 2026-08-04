import api from "./api";

// Get all lessons of a course
export const getLessons = async (courseId) => {

  const response = await api.get(
    `/lessons/${courseId}`
  );

  return response.data;
};

// Get a single lesson
export const getLessonById = async (lessonId) => {

  const response = await api.get(
    `/lessons/single/${lessonId}`
  );

  return response.data;
};

// Create Lesson
export const createLesson = async (lessonData) => {

  const response = await api.post(
    "/lessons",
    lessonData
  );

  return response.data;
};

//update lesson
export const updateLesson = async (
  lessonId,
  lessonData
) => {

  const response = await api.put(
    `/lessons/${lessonId}`,
    lessonData
  );

  return response.data;

};
export const deleteLesson = async (lessonId) => {

  const response = await api.delete(
    `/lessons/${lessonId}`
  );

  return response.data;

};