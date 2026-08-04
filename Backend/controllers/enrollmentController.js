import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";

// @desc    Request Enrollment
// @route   POST /api/enrollment
// @access  Private (Student)
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

    // Check existing enrollment request
    const existingEnrollment = await Enrollment.findOne({
      studentId,
      courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: `Enrollment already ${existingEnrollment.status}.`,
      });
    }

    // Create pending request
    const enrollment = await Enrollment.create({
      studentId,
      courseId,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message:
        "Enrollment request submitted successfully. Waiting for admin approval.",
      enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get Student Approved Courses
// @route   GET /api/enrollment/mycourses
// @access  Private (Student)
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Enrollment.find({
      studentId: req.user._id,
      status: "approved",
    }).populate("courseId");

    res.status(200).json(courses);
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