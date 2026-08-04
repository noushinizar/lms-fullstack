import Certificate from "../../models/Certificate.js";
import CourseProgress from "../../models/CourseProgress.js";

export const generateCertificate = async (
  studentId,
  courseId
) => {
  // Check course progress
  const progress = await CourseProgress.findOne({
    studentId,
    courseId,
  });

  if (!progress) {
    throw new Error("Course progress not found.");
  }

  if (!progress.completed) {
    throw new Error(
      "Complete the course to generate the certificate."
    );
  }

  // Check if certificate already exists
  const existingCertificate =
    await Certificate.findOne({
      studentId,
      courseId,
    });

  if (existingCertificate) {
    return existingCertificate;
  }

  // Generate unique certificate ID
  const count = await Certificate.countDocuments();

  const certificateId = `LMS-${new Date().getFullYear()}-${String(
    count + 1
  ).padStart(6, "0")}`;

  // Save certificate
  const certificate =
    await Certificate.create({
      studentId,
      courseId,
      certificateId,
    });

  return certificate;
};