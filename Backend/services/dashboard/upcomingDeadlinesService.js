import Enrollment from "../../models/Enrollment.js";
import Assignment from "../../models/Assignment.js";
import AssignmentSubmission from "../../models/AssignmentSubmission.js";
import Quiz from "../../models/Quiz.js";
import QuizResult from "../../models/QuizResult.js";
import Course from "../../models/Course.js";

export const getUpcomingDeadlines = async (studentId) => {
  // Student enrolled courses
  const enrollments = await Enrollment.find({
    studentId,
  }).select("courseId");

  const courseIds = enrollments.map(
    (item) => item.courseId
  );

  const today = new Date();

  
  // Assignments
  

  const assignments = await Assignment.find({
    courseId: { $in: courseIds },
    dueDate: { $gte: today },
  })
    .populate("courseId", "title")
    .sort({ dueDate: 1 });

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

  
  // Quizzes
  

  const quizzes = await Quiz.find({
    courseId: { $in: courseIds },
    dueDate: { $gte: today },
  })
    .populate("courseId", "title")
    .sort({ dueDate: 1 });

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

  
  // Merge + Sort
  

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