import api from "./api";

// ================================
// Student
// ================================

// Request Enrollment
export const requestEnrollment = async (courseId) => {
  const { data } = await api.post("/enrollment", {
    courseId,
  });

  return data;
};

// My Approved Courses
export const getMyCourses = async () => {
  const { data } = await api.get("/enrollment/mycourses");
  return data;
};

// My Enrollment Requests
export const getMyEnrollmentRequests = async () => {
  const { data } = await api.get("/enrollment/myrequests");
  return data;
};

// ================================
// Admin
// ================================

// Get All Enrollment Requests
export const getEnrollmentRequests = async () => {
  const { data } = await api.get("/admin/enrollments");
  return data;
};

// Approve Request
export const approveEnrollment = async (id) => {
  const { data } = await api.put(
    `/admin/enrollments/${id}/approve`
  );

  return data;
};

// Reject Request
export const rejectEnrollment = async (id) => {
  const { data } = await api.put(
    `/admin/enrollments/${id}/reject`
  );

  return data;
};

// ================================
// Mentor
// ================================

// Get Students Enrolled in a Course
export const getCourseStudents = async (courseId) => {
  const { data } = await api.get(
    `/enrollment/course/${courseId}/students`
  );

  return data;
};