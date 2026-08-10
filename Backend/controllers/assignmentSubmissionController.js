import AssignmentSubmission from "../models/AssignmentSubmission.js";
import Assignment from "../models/Assignment.js";
import Enrollment from "../models/Enrollment.js";
import { updateCourseProgress } from "../services/progress/progressService.js";

// =====================================================
// Student - Submit Assignment
// =====================================================
export const submitAssignment = async (req, res) => {
  try {
    const {
      assignmentId,
      githubLink,
      liveDemoLink,
      driveLink,
      notes,
    } = req.body;

    // Check assignment exists
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    // Check course enrollment
    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: assignment.courseId,
      status: "approved",
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You are not approved to access this course.",
      });
    }

    // Prevent duplicate submissions
    const existingSubmission = await AssignmentSubmission.findOne({
      assignmentId,
      studentId: req.user._id,
    });

    if (existingSubmission) {
      return res.status(400).json({
        message: "Assignment already submitted.",
      });
    }

    const submission = await AssignmentSubmission.create({
      assignmentId,
      studentId: req.user._id,
      githubLink,
      liveDemoLink,
      driveLink,
      notes,
    });

    // Update course progress
    await updateCourseProgress(
      req.user._id,
      assignment.courseId
    );

    res.status(201).json({
      message: "Assignment submitted successfully.",
      submission,
    });
  } catch (error) {
    console.error("Submit Assignment Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// Student - Get All My Submissions
// =====================================================
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({
      studentId: req.user._id,
    })
      .populate(
        "assignmentId",
        "title description courseId dueDate"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error("Get My Submissions Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Mentor/Admin - Get All Submissions For Assignment
// =====================================================
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(
      req.params.assignmentId
    ).populate("courseId", "mentor");

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    // Mentor access restriction
    if (req.user.role === "mentor") {
      if (
        !assignment.courseId ||
        assignment.courseId.mentor?.toString() !==
          req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You are not assigned to this course.",
        });
      }
    }

    const submissions = await AssignmentSubmission.find({
      assignmentId: req.params.assignmentId,
    })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error(
      "Get Assignment Submissions Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Mentor/Admin - Review Submission
// =====================================================
// =====================================================
// Mentor/Admin - Review Submission
// =====================================================
export const reviewSubmission = async (req, res) => {
  try {
    const { marksObtained, feedback } = req.body;

    const submission = await AssignmentSubmission.findById(
      req.params.id
    );

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found.",
      });
    }

    const assignment = await Assignment.findById(
      submission.assignmentId
    ).populate("courseId", "mentor");

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    // Mentor access restriction
    if (req.user.role === "mentor") {
      if (
        !assignment.courseId ||
        assignment.courseId.mentor?.toString() !==
          req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You are not assigned to this course.",
        });
      }
    }

    submission.marksObtained = marksObtained;
    submission.feedback = feedback;
    submission.status = "Reviewed";

    await submission.save();

    res.status(200).json({
      message: "Submission reviewed successfully.",
      submission,
    });
  } catch (error) {
    console.error("Review Submission Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// Student - Get My Submission For One Assignment
// =====================================================
export const getMySubmission = async (req, res) => {
  try {
    const submission = await AssignmentSubmission.findOne({
      assignmentId: req.params.assignmentId,
      studentId: req.user._id,
    });

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found.",
      });
    }

    res.status(200).json(submission);
  } catch (error) {
    console.error("Get My Submission Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};