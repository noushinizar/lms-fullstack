import Enrollment from "../../models/Enrollment.js";
import Assignment from "../../models/Assignment.js";
import AssignmentSubmission from "../../models/AssignmentSubmission.js";
import Quiz from "../../models/Quiz.js";
import QuizResult from "../../models/QuizResult.js";

export const getUpcomingDeadlines = async (studentId) => {

  // =====================================================
  // ONLY APPROVED COURSES
  // =====================================================

  const enrollments = await Enrollment.find({
    studentId,
    status: "approved",
  }).select("courseId");

  const courseIds = enrollments.map(
    (item) => item.courseId
  );

  const today = new Date();

  // =====================================================
  // UPCOMING ASSIGNMENTS
  // =====================================================

  const assignments = await Assignment.find({
    courseId: {
      $in: courseIds,
    },
    dueDate: {
      $gte: today,
    },
  })
    .populate("courseId", "title")
    .sort({
      dueDate: 1,
    });

  // =====================================================
  // ALREADY SUBMITTED ASSIGNMENTS
  // =====================================================

  const submittedAssignments =
    await AssignmentSubmission.find({
      studentId,
    }).select("assignmentId");

  const submittedIds =
    submittedAssignments.map(
      (item) => item.assignmentId.toString()
    );

  const pendingAssignments =
    assignments
      .filter(
        (assignment) =>
          assignment.courseId &&
          !submittedIds.includes(
            assignment._id.toString()
          )
      )
      .map((assignment) => ({
        type: "assignment",
        title: assignment.title,
        course: assignment.courseId.title,
        dueDate: assignment.dueDate,
      }));

  // =====================================================
  // UPCOMING QUIZZES
  // =====================================================

  const quizzes = await Quiz.find({
    courseId: {
      $in: courseIds,
    },
    dueDate: {
      $gte: today,
    },
  })
    .populate("courseId", "title")
    .sort({
      dueDate: 1,
    });

  // =====================================================
  // ALREADY ATTEMPTED QUIZZES
  // =====================================================

  const attemptedQuizzes =
    await QuizResult.find({
      studentId,
    }).select("quizId");

  const attemptedIds =
    attemptedQuizzes.map(
      (item) => item.quizId.toString()
    );

  const pendingQuizzes =
    quizzes
      .filter(
        (quiz) =>
          quiz.courseId &&
          !attemptedIds.includes(
            quiz._id.toString()
          )
      )
      .map((quiz) => ({
        type: "quiz",
        title: quiz.title,
        course: quiz.courseId.title,
        dueDate: quiz.dueDate,
      }));

  // =====================================================
  // COMBINE + SORT
  // =====================================================

  const deadlines = [
    ...pendingAssignments,
    ...pendingQuizzes,
  ];

  deadlines.sort(
    (a, b) =>
      new Date(a.dueDate) -
      new Date(b.dueDate)
  );

  return deadlines.slice(0, 5);
};

