import Enrollment from "../models/Enrollment.js";

const checkEnrollment = async (req, res, next) => {
  try {
    // Admin and mentor don't need student enrollment approval
    if (
      req.user.role === "admin" ||
      req.user.role === "mentor"
    ) {
      return next();
    }

    const courseId =
      req.params.courseId ||
      req.body.courseId ||
      req.query.courseId;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required.",
      });
    }

    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
      status: "approved",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not approved to access this course.",
      });
    }

    // Store enrollment for possible later use
    req.enrollment = enrollment;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default checkEnrollment;