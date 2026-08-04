import api from "./api";

export const getMentorDashboard = async () => {
  const { data } = await api.get("/mentor/dashboard");
  return data;
};