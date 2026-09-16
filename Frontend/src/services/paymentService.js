import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Create Razorpay order
export const createPaymentOrder = async (courseId) => {
  const response = await axios.post(
    `${API_URL}/payment/create-order`,
    { courseId },
    getAuthHeaders()
  );

  return response.data;
};

// Verify Razorpay payment
export const verifyPayment = async (paymentData) => {
  const response = await axios.post(
    `${API_URL}/payment/verify`,
    paymentData,
    getAuthHeaders()
  );

  return response.data;
};