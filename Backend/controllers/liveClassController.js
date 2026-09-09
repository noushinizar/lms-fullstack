import LiveClass from "../models/LiveClass.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";


// =====================================================
// CREATE LIVE CLASS
// Mentor can create only for their own course
// =====================================================
export const createLiveClass = async (req, res) => {
  try {
    const {
      courseId,
      title,
      description,
      meetingLink,
      scheduledAt,
    } = req.body;

    // Check required fields
    if (!courseId || !title || !meetingLink || !scheduledAt) {
      return res.status(400).json({
        message:
          "Course, title, meeting link and scheduled date are required.",
      });
    }

    // Check course exists
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found.",
      });
    }

    // Mentor can create classes only for their own course
    if (
      req.user.role === "mentor" &&
      course.mentor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can create live classes only for your own courses.",
      });
    }

    const liveClass = await LiveClass.create({
      courseId,
      title,
      description,
      meetingLink,
      scheduledAt,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Live class created successfully.",
      liveClass,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// =====================================================
// GET MENTOR LIVE CLASSES
// =====================================================
export const getMyLiveClasses = async (req, res) => {
  try {
    const liveClasses = await LiveClass.find({
      createdBy: req.user._id,
    })
      .populate("courseId", "title")
      .sort({ scheduledAt: 1 });

    res.json(liveClasses);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// =====================================================
// GET ALL LIVE CLASSES - ADMIN
// =====================================================
export const getAllLiveClasses = async (req, res) => {
  try {
    const now = new Date();

    // Automatically mark past scheduled classes as completed
    await LiveClass.updateMany(
      {
        scheduledAt: { $lte: now },
        status: "scheduled",
      },
      {
        $set: { status: "completed" },
      }
    );

    const liveClasses = await LiveClass.find()
      .populate("courseId", "title")
      .populate("createdBy", "name email")
      .sort({ scheduledAt: 1 });

    res.json(liveClasses);

  } catch (error) {
    console.error("Get All Live Classes Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// =====================================================
// GET STUDENT LIVE CLASSES
// Only approved course enrollments
// =====================================================
export const getStudentLiveClasses = async (req, res) => {
  try {

    // Find student's approved enrollments
    const enrollments = await Enrollment.find({
      studentId: req.user._id,
      status: "approved",
    });

    const courseIds = enrollments.map(
      (enrollment) => enrollment.courseId
    );

    // Get classes only from approved courses
    const liveClasses = await LiveClass.find({
      courseId: { $in: courseIds },
    })
      .populate("courseId", "title")
      .populate("createdBy", "name")
      .sort({ scheduledAt: 1 });

    res.json(liveClasses);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// =====================================================
// UPDATE LIVE CLASS
// Mentor can update only their own live classes
// =====================================================
export const updateLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(
      req.params.id
    );

    if (!liveClass) {
      return res.status(404).json({
        message: "Live class not found.",
      });
    }

    // Mentor ownership check
    if (
      req.user.role === "mentor" &&
      liveClass.createdBy.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can update only your own live classes.",
      });
    }

    liveClass.title =
      req.body.title ?? liveClass.title;

    liveClass.description =
      req.body.description ?? liveClass.description;

    liveClass.meetingLink =
      req.body.meetingLink ?? liveClass.meetingLink;

    liveClass.scheduledAt =
      req.body.scheduledAt ?? liveClass.scheduledAt;

    liveClass.status =
      req.body.status ?? liveClass.status;

    await liveClass.save();

    res.json({
      message: "Live class updated successfully.",
      liveClass,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// =====================================================
// DELETE / CANCEL LIVE CLASS
// =====================================================
export const deleteLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(
      req.params.id
    );

    if (!liveClass) {
      return res.status(404).json({
        message: "Live class not found.",
      });
    }

    // Mentor ownership check
    if (
      req.user.role === "mentor" &&
      liveClass.createdBy.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can delete only your own live classes.",
      });
    }

    await liveClass.deleteOne();

    res.json({
      message: "Live class deleted successfully.",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};