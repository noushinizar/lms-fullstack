import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";

export const createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create({
      courseId: req.body.courseId,
      title: req.body.title,
      videoUrl: req.body.videoUrl,
      description: req.body.description,
      order: req.body.order,
    });

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateLesson = async (req, res) => {

  try {

    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {

      return res.status(404).json({
        message: "Lesson not found"
      });

    }

    lesson.title =
      req.body.title || lesson.title;

    lesson.description =
      req.body.description || lesson.description;

    lesson.videoUrl =
      req.body.videoUrl || lesson.videoUrl;

    lesson.order =
      req.body.order || lesson.order;

    const updatedLesson = await lesson.save();

    res.json(updatedLesson);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
export const deleteLesson = async (req, res) => {
  try {

    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    const courseId = lesson.courseId;

    await lesson.deleteOne();

    // Get remaining lessons
    const lessons = await Lesson.find({
      courseId,
    }).sort({ order: 1 });

    // Reassign order values
    for (let i = 0; i < lessons.length; i++) {

      lessons[i].order = i + 1;

      await lessons[i].save();

    }

    res.json({
      message: "Lesson deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};
export const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({
      courseId: req.params.courseId,
    }).sort({ order: 1 });

    res.json(lessons);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    // Only students need lesson-lock validation
    if (req.user.role === "student") {
      // Get all lessons of this course
      const lessons = await Lesson.find({
        courseId: lesson.courseId,
      }).sort({ order: 1 });

      // Find current lesson position
      const currentIndex = lessons.findIndex(
        (item) => item._id.toString() === lesson._id.toString()
      );

      // First lesson is always unlocked
      if (currentIndex > 0) {
        // Get student progress
        const progress = await Progress.findOne({
          studentId: req.user._id,
          courseId: lesson.courseId,
        });

        const completedLessons =
          progress?.completedLessons.map((id) =>
            id.toString()
          ) || [];

        // Previous lesson
        const previousLessonId =
          lessons[currentIndex - 1]._id.toString();

        if (!completedLessons.includes(previousLessonId)) {
          return res.status(403).json({
            message:
              "Please complete the previous lesson first.",
          });
        }
      }
    }

    res.json(lesson);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};