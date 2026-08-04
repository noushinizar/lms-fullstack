import api from "./api";

// Get all certificates
export const getMyCertificates = async () => {
  const { data } = await api.get(
    "/student/certificates"
  );

  return data;
};

// Download certificate
export const downloadCertificate = async (
  courseId
) => {
  const response = await api.get(
    `/student/certificates/${courseId}/download`,
    {
      responseType: "blob",
    }
  );

  return response.data;
};

export const getCertificate = async (
  courseId
) => {
  const { data } = await api.get(
    `/student/certificates/course/${courseId}`
  );

  return data;
};