import api from "./api";

export const registerUser = async (userData) => {

  const response =
    await api.post(
      "/auth/register",
      userData
    );

  return response.data;
};

export const loginUser = async (userData) => {

  const response =
    await api.post(
      "/auth/login",
      userData
    );

  return response.data;
};

// Forgot Password
export const forgotPassword = async (email) => {
  const response = await api.post(
    "/auth/forgot-password",
    { email }
  );

  return response.data;
};

// Reset Password
export const resetPassword = async (token, password) => {
  const response = await api.post(
    `/auth/reset-password/${token}`,
    { password }
  );

  return response.data;
};


// Get all mentors
export const getMentors = async () => {
  const response = await api.get("/auth/mentors");
  return response.data;
};