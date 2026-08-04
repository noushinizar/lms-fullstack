import api from "./api";

export const getMyCourses = async () => {
  const response = await api.get("/courses/my-courses");
  return response.data;
};