import api from "./api";

// Create Assignment
export const createAssignment = async (assignmentData) => {
  const response = await api.post(
    "/assignments",
    assignmentData
  );

  return response.data;
};

// Get Assignments of Course
export const getAssignments = async (courseId) => {
  const response = await api.get(
    `/assignments/course/${courseId}`
  );

  return response.data;
};

// Get Single Assignment
export const getAssignmentById = async (assignmentId) => {
  const response = await api.get(
    `/assignments/${assignmentId}`
  );

  return response.data;
};

// Update Assignment
export const updateAssignment = async (
  assignmentId,
  assignmentData
) => {
  const response = await api.put(
    `/assignments/${assignmentId}`,
    assignmentData
  );

  return response.data;
};

// Delete Assignment
export const deleteAssignment = async (
  assignmentId
) => {
  const response = await api.delete(
    `/assignments/${assignmentId}`
  );

  return response.data;
};