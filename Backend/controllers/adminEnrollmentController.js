import Enrollment from "../models/Enrollment.js";


// ===============================================
// @desc    Get All Enrollment Requests
// @route   GET /api/admin/enrollments
// @access  Private/Admin
// ===============================================
export const getEnrollmentRequests = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("studentId", "name email phone")
      .populate("courseId", "title thumbnail price mentor")
      .populate("approvedBy", "name")
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
// @desc    Approve Enrollment
// @route   PUT /api/admin/enrollments/:id/approve
// @access  Private/Admin
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
        message: "Enrollment already approved.",
      });
    }

    enrollment.status = "approved";
    enrollment.approvedAt = new Date();
    enrollment.approvedBy = req.user._id;

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
// @desc    Reject Enrollment
// @route   PUT /api/admin/enrollments/:id/reject
// @access  Private/Admin
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
        message: "Enrollment already rejected.",
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