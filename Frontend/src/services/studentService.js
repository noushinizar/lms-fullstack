import api from "./api";

export const getCourseStudents = async (courseId) => {
  const response = await api.get(
    `/enrollments/course/${courseId}/students`
  );

  return response.data;
};