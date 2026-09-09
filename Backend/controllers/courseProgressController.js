
import CourseProgress from "../models/CourseProgress.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

export const getCourseProgress = async (req, res) => {
  try {
    const studentId = req.user._id;
    const courseId = req.params.courseId;

    // Check approved enrollment
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId,
      status: "approved",
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You are not approved to access this course.",
      });
    }

    // Find existing course progress
    const progress = await CourseProgress.findOne({
      studentId,
      courseId,
    }).populate("courseId", "title thumbnail");

    // No progress yet
    if (!progress) {
      const course = await Course.findById(courseId).select(
        "title thumbnail"
      );

      if (!course) {
        return res.status(404).json({
          message: "Course not found.",
        });
      }

      return res.json({
        studentId,
        courseId: course,

        lessonsCompleted: 0,
        totalLessons: 0,

        quizzesCompleted: 0,
        totalQuizzes: 0,

        assignmentsCompleted: 0,
        totalAssignments: 0,

        progress: 0,

        lessonPercentage: 0,
        quizPercentage: 0,
        assignmentPercentage: 0,

        completed: false,
      });
    }

    res.json(progress);

  } catch (error) {
    console.error("Get Course Progress Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
