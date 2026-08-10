import api from "./api";

// Submit Assignment
export const submitAssignment = async (data) => {
  const response = await api.post(
    "/submissions",
    data
  );

  return response.data;
};

// Student - Get all my submissions
export const getMySubmissions = async () => {
  const response = await api.get("/submissions/my");

  return response.data.submissions;
};

// Student - Get my submission for one assignment
export const getMySubmission = async (assignmentId) => {
  const response = await api.get(
    `/submissions/my/${assignmentId}`
  );

  return response.data;
};

// Mentor - Get submissions of an assignment
export const getAssignmentSubmissions = async (
  assignmentId
) => {
  const response = await api.get(
    `/submissions/assignment/${assignmentId}`
  );

  return response.data.submissions;
};

// Review Assignment
export const reviewSubmission = async (
  submissionId,
  reviewData
) => {
  const response = await api.put(
    `/submissions/${submissionId}/review`,
    reviewData
  );

  return response.data;
};