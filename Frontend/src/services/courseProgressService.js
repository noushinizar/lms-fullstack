import api from "./api";

export const getCourseProgress = async (courseId) => {
  const response = await api.get(`/course-progress/${courseId}`);

  return response.data;
};