import CourseProgress from "../models/CourseProgress.js";

export const getCourseProgress = async (req, res) => {
  try {
    const progress = await CourseProgress.findOne({
      studentId: req.user._id,
      courseId: req.params.courseId,
    }).populate("courseId", "title thumbnail");

    if (!progress) {
      return res.status(404).json({
        message: "Progress not found.",
      });
    }

    res.json(progress);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};