import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    lessonsCompleted: {
      type: Number,
      default: 0,
    },

    totalLessons: {
      type: Number,
      default: 0,
    },

    quizzesCompleted: {
      type: Number,
      default: 0,
    },

    totalQuizzes: {
      type: Number,
      default: 0,
    },

    assignmentsCompleted: {
      type: Number,
      default: 0,
    },

    totalAssignments: {
      type: Number,
      default: 0,
    },

    progress: {
      type: Number,
      default: 0,
    },

    completed: {
      type: Boolean,
      default: false,
    },
    lessonPercentage: {
      type: Number,
      default: 0,
    },

    quizPercentage: {
      type: Number,
      default: 0,
    },

    assignmentPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

courseProgressSchema.index(
  {
    studentId: 1,
    courseId: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model("CourseProgress", courseProgressSchema);
