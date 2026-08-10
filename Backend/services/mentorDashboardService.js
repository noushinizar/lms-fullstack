import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import Assignment from "../models/Assignment.js";
import AssignmentSubmission from "../models/AssignmentSubmission.js";
import Quiz from "../models/Quiz.js";

export const getDashboardData = async (mentorId) => {
  // =====================================================
  // Mentor Courses
  // =====================================================

  const courses = await Course.find({
    mentor: mentorId,
  });

  const courseIds = courses.map(
    (course) => course._id
  );

  // =====================================================
  // Statistics
  // =====================================================

  const totalCourses = courses.length;

  const totalLessons = await Lesson.countDocuments({
    courseId: { $in: courseIds },
  });

  const totalStudents = await Enrollment.countDocuments({
    courseId: { $in: courseIds },
  });

  // Get assignments belonging to mentor's courses
  const mentorAssignments = await Assignment.find({
    courseId: { $in: courseIds },
  }).select("_id");

  const assignmentIds = mentorAssignments.map(
    (assignment) => assignment._id
  );

  const pendingReviews =
    await AssignmentSubmission.countDocuments({
      status: "Pending",
      assignmentId: {
        $in: assignmentIds,
      },
    });

  // =====================================================
  // Assigned Courses
  // =====================================================

  const assignedCourses = await Promise.all(
    courses.map(async (course) => {
      const students = await Enrollment.countDocuments({
        courseId: course._id,
      });

      const lessons = await Lesson.countDocuments({
        courseId: course._id,
      });

      return {
        _id: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        students,
        lessons,
      };
    })
  );

  // =====================================================
  // Recent Lessons
  // =====================================================

  const recentLessons = await Lesson.find({
    courseId: { $in: courseIds },
  })
    .sort({ createdAt: -1 })
    .limit(3);

  // =====================================================
  // Recent Assignments
  // =====================================================

  const recentAssignments = await Assignment.find({
    courseId: { $in: courseIds },
  })
    .sort({ createdAt: -1 })
    .limit(3);

  // =====================================================
  // Recent Quizzes
  // =====================================================

  const recentQuizzes = await Quiz.find({
    courseId: { $in: courseIds },
  })
    .sort({ createdAt: -1 })
    .limit(3);

  // =====================================================
  // Recent Activity
  // =====================================================

  const recentActivity = [
    ...recentLessons.map((lesson) => ({
      type: "lesson",
      title: `Lesson Created: ${lesson.title}`,
      date: lesson.createdAt,
    })),

    ...recentAssignments.map((assignment) => ({
      type: "assignment",
      title: `Assignment Created: ${assignment.title}`,
      date: assignment.createdAt,
    })),

    ...recentQuizzes.map((quiz) => ({
      type: "quiz",
      title: `Quiz Created: ${quiz.title}`,
      date: quiz.createdAt,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.date) - new Date(a.date)
    )
    .slice(0, 5);

  // =====================================================
  // Pending Reviews
  // ONLY submissions from mentor's courses
  // =====================================================

  const pendingAssignments =
    await AssignmentSubmission.find({
      status: "Pending",
      assignmentId: {
        $in: assignmentIds,
      },
    })
      .populate("studentId", "name")
      .populate({
        path: "assignmentId",
        select: "title courseId",
        populate: {
          path: "courseId",
          select: "title mentor",
        },
      })
      .sort({ createdAt: -1 })
      .limit(5);

  // =====================================================
  // Return Dashboard Data
  // =====================================================

  return {
    totalCourses,
    totalStudents,
    totalLessons,
    pendingReviews,
    assignedCourses,
    recentActivity,
    pendingAssignments,
  };
};