import Enrollment from "../models/Enrollment.js";

// ===============================================
// Get All Enrollment Requests
// ===============================================
export const getEnrollmentRequests = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("studentId", "name email phone")
      .populate("courseId", "title thumbnail price mentor")
      .populate("approvedBy", "name")
      .populate("revokedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================================
// Approve Enrollment
// ===============================================
export const approveEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment request not found.",
      });
    }

    if (enrollment.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Enrollment is already approved.",
      });
    }

    if (enrollment.status === "revoked") {
      return res.status(400).json({
        success: false,
        message: "A revoked enrollment cannot be approved directly.",
      });
    }

    enrollment.status = "approved";
    enrollment.approvedAt = new Date();
    enrollment.approvedBy = req.user._id;

    // Clear revoke information
    enrollment.revokedAt = undefined;
    enrollment.revokedBy = undefined;

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Enrollment approved successfully.",
      enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================================
// Reject Enrollment
// ===============================================
export const rejectEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment request not found.",
      });
    }

    if (enrollment.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Enrollment is already rejected.",
      });
    }

    if (enrollment.status === "approved") {
      return res.status(400).json({
        success: false,
        message:
          "Approved enrollment cannot be rejected. Use Remove Student instead.",
      });
    }

    if (enrollment.status === "revoked") {
      return res.status(400).json({
        success: false,
        message: "Revoked enrollment cannot be rejected.",
      });
    }

    enrollment.status = "rejected";
    enrollment.approvedBy = req.user._id;
    enrollment.approvedAt = new Date();

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Enrollment rejected.",
      enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================================
// Revoke Approved Enrollment
// @route PUT /api/admin/enrollments/:id/revoke
// @access Private/Admin
// ===============================================
export const revokeEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    if (enrollment.status !== "approved") {
      return res.status(400).json({
        success: false,
        message:
          "Only approved enrollments can be removed from a course.",
      });
    }

    enrollment.status = "revoked";
    enrollment.revokedAt = new Date();
    enrollment.revokedBy = req.user._id;

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Student removed from the course successfully.",
      enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};