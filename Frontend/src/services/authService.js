import api from "./api";

// ======================================================
// REGISTER USER
// ======================================================

export const registerUser = async (userData) => {
  const response = await api.post(
    "/auth/register",
    userData
  );

  return response.data;
};

// ======================================================
// LOGIN USER
// ======================================================

export const loginUser = async (userData) => {
  const response = await api.post(
    "/auth/login",
    userData
  );

  return response.data;
};

// ======================================================
// FORGOT PASSWORD - SEND OTP
// ======================================================

export const forgotPassword = async (email) => {
  const response = await api.post(
    "/auth/forgot-password",
    { email }
  );

  return response.data;
};

// ======================================================
// VERIFY RESET OTP
// ======================================================

export const verifyResetOtp = async (email, otp) => {
  const response = await api.post(
    "/auth/verify-reset-otp",
    {
      email,
      otp,
    }
  );

  return response.data;
};

// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPassword = async (resetToken, password) => {
  const response = await api.post(
    "/auth/reset-password",
    {
      resetToken,
      password,
    }
  );

  return response.data;
};
// ======================================================
// ACCOUNT ACTIVATION
// ======================================================

export const activateAccount = async (token, password) => {
  const response = await api.post("/auth/activate-account", {
    token,
    password,
  });

  return response.data;
};

// ======================================================
// GET MENTORS
// ======================================================

export const getMentors = async () => {
  const response = await api.get("/auth/mentors");

  return response.data;
};
