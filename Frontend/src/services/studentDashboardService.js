import api from "./api";

export const getStudentDashboard = async () => {
  const { data } = await api.get("/student/dashboard/student");
  return data;
};