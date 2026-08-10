import AssignmentSubmission from "../models/AssignmentSubmission.js";
import Assignment from "../models/Assignment.js";
import Enrollment from "../models/Enrollment.js";
import { updateCourseProgress } from "../services/progress/progressService.js";


// Student submits assignment
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

    await updateCourseProgress(
      req.user._id,
      assignment.courseId
    );

    res.status(201).json({
      message: "Assignment submitted successfully.",
      submission,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Student - My submissions
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


// Mentor Review Submission

export const reviewSubmission = async (req, res) => {
  try {
    const { marksObtained, feedback } = req.body;

    const submission = await AssignmentSubmission.findById(
      req.params.id
    );

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    submission.marksObtained = marksObtained;
    submission.feedback = feedback;
    submission.status = "Reviewed";

    await submission.save();

    res.json({
      message: "Submission reviewed successfully.",
      submission,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Student - Get my submission for a particular assignment

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

    res.json(submission);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};