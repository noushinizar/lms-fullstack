import Enrollment from "../models/Enrollment.js";
import Assignment from "../models/Assignment.js";
import AssignmentSubmission from "../models/AssignmentSubmission.js";
import CourseProgress from "../models/CourseProgress.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";
import QuizResult from "../models/QuizResult.js";
import { getUpcomingDeadlines } from "../services/dashboard/upcomingDeadlinesService.js";

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    const enrollments = await Enrollment.find({
      studentId,
      status: "approved",
    }).select("courseId");

    const courseIds = enrollments.map(
      (item) => item.courseId
    );

    // Only approved/enrolled courses are counted
    const totalCourses = courseIds.length;

 

    // Assignments are only taken from approved courses
    const totalAssignments =
      await Assignment.countDocuments({
        courseId: {
          $in: courseIds,
        },
      });

    const submittedAssignments =
      await AssignmentSubmission.countDocuments({
        studentId,
      });

    const pendingAssignments = Math.max(
      0,
      totalAssignments - submittedAssignments
    );


    // Only progress belonging to currently approved courses
    // should affect dashboard progress.
    const progressList =
      await CourseProgress.find({
        studentId,
        courseId: {
          $in: courseIds,
        },
      });

    let averageProgress = 0;

    if (progressList.length > 0) {
      averageProgress = Math.round(
        progressList.reduce(
          (sum, item) => sum + item.progress,
          0
        ) / progressList.length
      );
    }

    

    // Count completed progress only for approved courses
    const certificates =
      progressList.filter(
        (item) => item.completed
      ).length;

    

    let continueCourse = null;

    const courseProgress =
      await CourseProgress.find({
        studentId,
        courseId: {
          $in: courseIds,
        },
        completed: false,
      }).sort({
        progress: -1,
      });

    if (courseProgress.length > 0) {
      const progress = courseProgress[0];

      const course =
        await Course.findById(
          progress.courseId
        ).select(
          "title thumbnail"
        );

      // Make sure the course still exists
      if (course) {
        const totalLessons =
          await Lesson.countDocuments({
            courseId: progress.courseId,
          });

        continueCourse = {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail,
          progress: progress.progress,
          completedLessons:
            progress.lessonsCompleted,
          totalLessons,
        };
      }
    }

    

    const recentLessons =
      await LessonProgress.find({
        studentId,
      })
        .populate(
          "lessonId",
          "title courseId"
        )
        .sort({
          createdAt: -1,
        })
        .limit(20);

    // Only keep lessons belonging to approved courses
    const approvedCourseIdSet =
      new Set(
        courseIds.map(
          (id) => id.toString()
        )
      );

    const filteredRecentLessons =
      recentLessons.filter(
        (lesson) =>
          lesson.lessonId &&
          approvedCourseIdSet.has(
            lesson.lessonId.courseId?.toString()
          )
      );


    const recentAssignments =
      await AssignmentSubmission.find({
        studentId,
      })
        .populate(
          "assignmentId",
          "title courseId"
        )
        .sort({
          createdAt: -1,
        })
        .limit(20);

    // Only keep assignments belonging to approved courses
    const filteredRecentAssignments =
      recentAssignments.filter(
        (assignment) =>
          assignment.assignmentId &&
          approvedCourseIdSet.has(
            assignment.assignmentId.courseId?.toString()
          )
      );

    

    const recentQuizzes =
      await QuizResult.find({
        studentId,
      })
        .populate(
          "quizId",
          "title courseId"
        )
        .sort({
          createdAt: -1,
        })
        .limit(20);

    // Only keep quizzes belonging to approved courses
    const filteredRecentQuizzes =
      recentQuizzes.filter(
        (quiz) =>
          quiz.quizId &&
          approvedCourseIdSet.has(
            quiz.quizId.courseId?.toString()
          )
      );

    

    const recentActivity = [];

  

    filteredRecentLessons.forEach(
      (lesson) => {
        recentActivity.push({
          type: "lesson",
          title: `Completed Lesson: ${lesson.lessonId?.title}`,
          date: lesson.createdAt,
        });
      }
    );



    filteredRecentAssignments.forEach(
      (assignment) => {
        recentActivity.push({
          type: "assignment",
          title: `Submitted Assignment: ${assignment.assignmentId?.title}`,
          date: assignment.createdAt,
        });
      }
    );


    filteredRecentQuizzes.forEach(
      (quiz) => {
        recentActivity.push({
          type: "quiz",
          title: "Completed Quiz",
          date: quiz.createdAt,
        });
      }
    );

    // Sort latest activity first
    recentActivity.sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    );

    const latestActivity =
      recentActivity.slice(0, 5);

    
    const upcomingDeadlines =
      await getUpcomingDeadlines(
        studentId
      );

   
    res.json({
      totalCourses,
      pendingAssignments,
      averageProgress,
      certificates,
      continueCourse,
      recentActivity: latestActivity,
      upcomingDeadlines,
    });

  } catch (error) {
    console.error(
      "STUDENT DASHBOARD ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

