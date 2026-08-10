import Assignment from "../models/Assignment.js";
import Enrollment from "../models/Enrollment.js";
// Create Assignment
export const createAssignment = async (req, res) => {
  try {

    const assignment = await Assignment.create({
      courseId: req.body.courseId,
      title: req.body.title,
      description: req.body.description,
      requirements: req.body.requirements,
      dueDate: req.body.dueDate,
      maxMarks: req.body.maxMarks,
    });

    res.status(201).json(assignment);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// Get All Assignments of a Course
export const getAssignments = async (req, res) => {
  try {

    const assignments = await Assignment.find({
      courseId: req.params.courseId,
    }).sort({ createdAt: -1 });

    res.json(assignments);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// Get Single Assignment
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(
      req.params.assignmentId
    );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    // Check course enrollment for students
    if (req.user.role === "student") {
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
    }

    res.json(assignment);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Assignment
export const updateAssignment = async (req, res) => {
  try {

    const assignment = await Assignment.findById(
      req.params.assignmentId
    );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    assignment.title = req.body.title;
    assignment.description = req.body.description;
    assignment.requirements = req.body.requirements;
    assignment.dueDate = req.body.dueDate;
    assignment.maxMarks = req.body.maxMarks;

    await assignment.save();

    res.json({
      message: "Assignment updated successfully.",
      assignment,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// Delete Assignment
export const deleteAssignment = async (req, res) => {
  try {

    const assignment = await Assignment.findById(
      req.params.assignmentId
    );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    await assignment.deleteOne();

    res.json({
      message: "Assignment deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};