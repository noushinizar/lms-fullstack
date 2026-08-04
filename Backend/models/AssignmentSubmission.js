import mongoose from "mongoose";

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    githubLink: {
      type: String,
      required: true,
    },

    liveDemoLink: {
      type: String,
    },

    driveLink: {
      type: String,
    },

    notes: {
      type: String,
    },

    // Mentor Review

    marksObtained: {
      type: Number,
      default: 0,
    },

    feedback: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Reviewed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);