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

    
    // Dashboard Statistics


    const totalCourses = await Enrollment.countDocuments({
      studentId,
    });

    const enrollments = await Enrollment.find({
      studentId,
    }).select("courseId");

    const courseIds = enrollments.map(
      (item) => item.courseId
    );

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

    const pendingAssignments =
      totalAssignments - submittedAssignments;

    const progressList =
      await CourseProgress.find({
        studentId,
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

    const certificates =
      progressList.filter(
        (item) => item.completed
      ).length;

    
    // Continue Learning
    

    let continueCourse = null;

    const courseProgress =
      await CourseProgress.find({
        studentId,
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

    
    // Recent Activity
    

    const recentLessons =
      await LessonProgress.find({
        studentId,
      })
        .populate(
          "lessonId",
          "title",
          
        )
        
        .sort({
          createdAt: -1,
        })
        .limit(5);
       
    const recentAssignments =
      await AssignmentSubmission.find({
        studentId,
      })
        .populate(
          "assignmentId",
          "title"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5);

    const recentQuizzes =
      await QuizResult.find({
        studentId,
      })
        .populate(
          "quizId",
          "title"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5);

    const recentActivity = [];

    // Lesson Activity

    recentLessons.forEach(
      (lesson) => {
        recentActivity.push({
          type: "lesson",
          title: `Completed Lesson: ${lesson.lessonId?.title}`,
          date: lesson.createdAt,
        });
      }
    );

    // Assignment Activity

    recentAssignments.forEach(
      (assignment) => {
        recentActivity.push({
          type: "assignment",
          title: `Submitted Assignment: ${assignment.assignmentId?.title}`,
          date: assignment.createdAt,
        });
      }
    );

    // Quiz Activity

    recentQuizzes.forEach(
      (quiz) => {
        recentActivity.push({
          type: "quiz",
          title: `Completed Quiz`,
          date: quiz.createdAt,
        });
      }
    );

    recentActivity.sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    );

    const latestActivity =
      recentActivity.slice(0, 5);

      const upcomingDeadlines =
  await getUpcomingDeadlines(studentId);

    
    // Response
    

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

    res.status(500).json({
      message: error.message,
    });

  }
};