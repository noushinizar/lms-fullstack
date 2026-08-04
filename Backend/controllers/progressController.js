import Progress from "../models/Progress.js";
import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";
import { updateCourseProgress } from "../services/progress/progressService.js";

export const markLessonComplete = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId, lessonId } = req.body;

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

      // Save lesson completion history
      await LessonProgress.create({
        studentId,
        courseId,
        lessonId,
      });

    } else {

      // Check if lesson already completed
      const alreadyCompleted = progress.completedLessons.some(
        (id) => id.toString() === lessonId
      );

      if (!alreadyCompleted) {

        // Update Progress model
        progress.completedLessons.push(lessonId);
        await progress.save();

        // Save lesson history for Recent Activity
        await LessonProgress.create({
          studentId,
          courseId,
          lessonId,
        });

      }
    }

    // Update overall course progress
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