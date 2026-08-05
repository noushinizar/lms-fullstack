import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";


export const enrollCourse = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required.",
      });
    }

    // Check course exists
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // Check existing enrollment
    const existingEnrollment = await Enrollment.findOne({
      studentId,
      courseId,
    });

    // =================================================
    // No previous enrollment
    // =================================================
    if (!existingEnrollment) {
      const enrollment = await Enrollment.create({
        studentId,
        courseId,
        status: "pending",
        requestedAt: new Date(),
      });

      return res.status(201).json({
        success: true,
        message:
          "Enrollment request submitted successfully. Waiting for admin approval.",
        enrollment,
      });
    }

    // =================================================
    // Already pending
    // =================================================
    if (existingEnrollment.status === "pending") {
      return res.status(400).json({
        success: false,
        message: "Your enrollment request is already pending.",
      });
    }

    // =================================================
    // Already approved
    // =================================================
    if (existingEnrollment.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course.",
      });
    }

    // =================================================
    // Rejected OR Revoked
    // Allow student to request enrollment again
    // =================================================
    if (
      existingEnrollment.status === "rejected" ||
      existingEnrollment.status === "revoked"
    ) {
      existingEnrollment.status = "pending";
      existingEnrollment.requestedAt = new Date();

      // Clear previous approval information
      existingEnrollment.approvedAt = undefined;
      existingEnrollment.approvedBy = undefined;

      // Clear previous revoke information
      existingEnrollment.revokedAt = undefined;
      existingEnrollment.revokedBy = undefined;

      await existingEnrollment.save();

      return res.status(200).json({
        success: true,
        message:
          "Enrollment request resubmitted successfully. Waiting for admin approval.",
        enrollment: existingEnrollment,
      });
    }

    // =================================================
    // Fallback
    // =================================================
    return res.status(400).json({
      success: false,
      message: "Unable to submit enrollment request.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// @desc    Get Student Enrollment Requests
// @route   GET /api/enrollment/myrequests
// @access  Private (Student)
export const getMyEnrollmentRequests = async (req, res) => {
  try {
    const requests = await Enrollment.find({
      studentId: req.user._id,
    })
      .populate("courseId")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mentor - Get Students of Course
// @route   GET /api/enrollment/course/:courseId/students
// @access  Private (Mentor/Admin)
export const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Only approved students
    const enrollments = await Enrollment.find({
      courseId,
      status: "approved",
    })
      .populate("studentId", "name email phone")
      .sort({ createdAt: -1 });

    const students = await Promise.all(
      enrollments.map(async (enrollment) => {
        const progress = await Progress.findOne({
          studentId: enrollment.studentId._id,
          courseId,
        });

        const totalLessons = await Lesson.countDocuments({
          courseId,
        });

        const completedLessons =
          progress?.completedLessons?.length || 0;

        const percentage =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return {
          student: enrollment.studentId,
          status: enrollment.status,
          requestedAt: enrollment.requestedAt,
          approvedAt: enrollment.approvedAt,
          progress: percentage,
        };
      })
    );

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};