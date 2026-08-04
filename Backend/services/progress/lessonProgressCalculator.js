import Lesson from "../../models/Lesson.js";
import Progress from "../../models/Progress.js";

export const calculateLessonProgress = async (
  studentId,
  courseId
) => {
  const totalLessons = await Lesson.countDocuments({
    courseId,
  });

  const progress = await Progress.findOne({
    studentId,
    courseId,
  });

  const lessonsCompleted =
    progress?.completedLessons.length || 0;

  return {
    totalLessons,
    lessonsCompleted,
  };
};