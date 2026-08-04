import CourseProgress from "../../models/CourseProgress.js";

import { calculateLessonProgress } from "./lessonProgressCalculator.js";
import { calculateQuizProgress } from "./quizProgressCalculator.js";
import { calculateAssignmentProgress } from "./assignmentProgressCalculator.js";
import { generateCertificate } from "../certificate/certificateService.js";

export const updateCourseProgress = async (studentId, courseId) => {
  try {

    // Calculate lesson progress
    const lesson = await calculateLessonProgress(studentId, courseId);

    // Calculate quiz progress
    const quiz = await calculateQuizProgress(studentId, courseId);

    // Calculate assignment progress
    const assignment = await calculateAssignmentProgress(studentId, courseId);

    // Progress weightages
    let lessonPercentage = 0;
    let quizPercentage = 0;
    let assignmentPercentage = 0;

    
    if (lesson.totalLessons > 0) {
      lessonPercentage = (lesson.lessonsCompleted / lesson.totalLessons) * 40;
    }

   
    if (quiz.totalQuizzes > 0) {
      quizPercentage = (quiz.quizzesCompleted / quiz.totalQuizzes) * 30;
    }

    
    if (assignment.totalAssignments > 0) {
      assignmentPercentage =
        (assignment.assignmentsCompleted / assignment.totalAssignments) * 30;
    }

    // Overall progress
    const progress = Math.round(
      lessonPercentage + quizPercentage + assignmentPercentage,
    );
   
    // Save / Update Course Progress
   const courseProgress =
  await CourseProgress.findOneAndUpdate(
    {
      studentId,
      courseId,
    },
    {
      ...lesson,
      ...quiz,
      ...assignment,

      lessonPercentage,
      quizPercentage,
      assignmentPercentage,

      progress,
      completed: progress === 100,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
  // Auto generate certificate
if (courseProgress.completed) {
  await generateCertificate(
    studentId,
    courseId
  );
}
   
  } catch (error) {
    console.error("Course Progress Update Error:", error);

    throw error;
  }
};
