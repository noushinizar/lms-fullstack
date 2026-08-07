import Progress from "../models/Progress.js";
import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";
import { updateCourseProgress } from "../services/progress/progressService.js";

export const markLessonComplete = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId, lessonId } = req.body;

    // ==========================================
    // Check approved enrollment
    // ==========================================

    const enrollment = await Enrollment.findOne({
      studentId,
      courseId,
      status: "approved",
    });

    if (!enrollment) {
      return res.status(403).json({
        message:
          "You are not approved to access this course.",
      });
    }

    // Find student's progress for this course
    let progress = await Progress.findOne({
      studentId,
      courseId,
    });

    // If progress doesn't exist, create it
    if (!progress) {
      progress = await Progress.create({
        studentId,
        courseId,
        completedLessons: [lessonId],
      });

      await LessonProgress.create({
        studentId,
        courseId,
        lessonId,
      });
    } else {
      const alreadyCompleted =
        progress.completedLessons.some(
          (id) => id.toString() === lessonId
        );

      if (!alreadyCompleted) {
        progress.completedLessons.push(lessonId);

        await progress.save();

        await LessonProgress.create({
          studentId,
          courseId,
          lessonId,
        });
      }
    }

    await updateCourseProgress(studentId, courseId);

    res.json({
      message: "Lesson completed successfully.",
      progress,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProgress = async (req, res) => {
  try {
    const studentId = req.user._id;
    const courseId = req.params.courseId;

    // ==========================================
    // Check approved enrollment
    // ==========================================

    const enrollment = await Enrollment.findOne({
      studentId,
      courseId,
      status: "approved",
    });

    if (!enrollment) {
      return res.status(403).json({
        message:
          "You are not approved to access this course.",
      });
    }

    const progress = await Progress.findOne({
      studentId,
      courseId,
    }).populate("completedLessons");

    const totalLessons = await Lesson.countDocuments({
      courseId,
    });

    const completed =
      progress?.completedLessons.length || 0;

    const percentage =
      totalLessons === 0
        ? 0
        : (completed / totalLessons) * 100;

    res.json({
      totalLessons,
      completed,
      percentage,
      completedLessons:
        progress?.completedLessons || [],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};