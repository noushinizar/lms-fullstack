import api from "./api";

// ==========================================
// MENTOR
// ==========================================

// Create live class
export const createLiveClass = async (liveClassData) => {
  const response = await api.post(
    "/live-classes",
    liveClassData
  );

  return response.data;
};

// Get mentor's own live classes
export const getMyLiveClasses = async () => {
  const response = await api.get(
    "/live-classes/my"
  );

  return response.data;
};

// Update live class
export const updateLiveClass = async (
  liveClassId,
  liveClassData
) => {
  const response = await api.put(
    `/live-classes/${liveClassId}`,
    liveClassData
  );

  return response.data;
};

// Delete live class
export const deleteLiveClass = async (liveClassId) => {
  const response = await api.delete(
    `/live-classes/${liveClassId}`
  );

  return response.data;
};


// ==========================================
// STUDENT
// ==========================================

// Get live classes from student's approved courses
export const getStudentLiveClasses = async () => {
  const response = await api.get(
    "/live-classes/student"
  );

  return response.data;
};


// ==========================================
// ADMIN
// ==========================================

// Get all live classes
export const getAllLiveClasses = async () => {
  const response = await api.get(
    "/live-classes/admin"
  );

  return response.data;
};