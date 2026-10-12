import api from "./api";

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const createCounselor = async (counselorData) => {
  const response = await api.post("/users/counselors", counselorData);
  return response.data;
};


export const updateCounselor = async (counselorId, counselorData) => {
  const response = await api.put(
    `/users/counselors/${counselorId}`,
    counselorData
  );

  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.put(`/users/${userId}/role`, {
    role,
  });

  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);

  return response.data;
};