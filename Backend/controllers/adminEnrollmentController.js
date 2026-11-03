import Enrollment from "../models/Enrollment.js";
import Payment from "../models/Payment.js";
import Lead from "../models/Lead.js";
import LeadActivity from "../models/LeadActivity.js";
import User from "../models/User.js";


const logEnrollmentActivity = async ({
  enrollment,
  performedBy,
  action,
  description,
}) => {
  try {
    const studentId = enrollment.studentId;
    const courseId = enrollment.courseId;

    if (!studentId || !courseId) return;

    const student = await User.findById(studentId).select("email");

    if (!student?.email) return;

    const lead = await Lead.findOne({
      email: student.email.trim().toLowerCase(),
      interestedCourse: courseId,
      status: "converted",
    });

    if (!lead) return;

    await LeadActivity.create({
      lead: lead._id,
      performedBy,
      action,
      description,
    });
  } catch (error) {
    // Enrollment has already been updated.
    // Do not report the enrollment action as failed just because
    // timeline logging encountered an error.
    console.error("Enrollment activity logging error:", error);
  }
};


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

    // Attach payment information to each enrollment
    const enrollmentsWithPayments = await Promise.all(
      enrollments.map(async (enrollment) => {
        const payment = await Payment.findOne({
          studentId: enrollment.studentId?._id,
          courseId: enrollment.courseId?._id,
          status: "paid",
        }).sort({ paidAt: -1 });

        return {
          enrollment,
          payment,
        };
      }),
    );

    res.status(200).json({
      success: true,
      count: enrollmentsWithPayments.length,
      enrollments: enrollmentsWithPayments,
    });
  } catch (error) {
    console.error("Get enrollment requests error:", error);

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

    await logEnrollmentActivity({
      enrollment,
      performedBy: req.user._id,
      action: "enrollment_approved",
      description: "Student enrollment was approved.",
    });
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
    enrollment.rejectedBy = req.user._id;
    enrollment.rejectedAt = new Date();

    // Clear approval information
    enrollment.approvedBy = undefined;
    enrollment.approvedAt = undefined;

    await enrollment.save();

    await logEnrollmentActivity({
      enrollment,
      performedBy: req.user._id,
      action: "enrollment_rejected",
      description: "Student enrollment was rejected.",
    });

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
        message: "Only approved enrollments can be removed from a course.",
      });
    }

    enrollment.status = "revoked";
    enrollment.revokedAt = new Date();
    enrollment.revokedBy = req.user._id;

    await enrollment.save();

    await logEnrollmentActivity({
      enrollment,
      performedBy: req.user._id,
      action: "enrollment_revoked",
      description: "Student was removed from the course.",
    });

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
