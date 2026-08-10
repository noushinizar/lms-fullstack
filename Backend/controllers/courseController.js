import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

export const createCourse = async (req, res) => {
  try {
    const course = await Course.create({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      thumbnail: req.body.thumbnail,
      mentor: req.body.mentor,
      category: req.body.category,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("mentor", "name email");

    res.json(courses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMentorCourses = async (req, res) => {
  try {

    const courses = await Course.find({
      mentor: req.user._id,
    }).populate("mentor", "name email");

    res.json(courses);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

export const getCourseById = async (req, res) => {
  try {

    const course = await Course.findById(req.params.id)
      .populate(
        "mentor",
        "name email"
      );


    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }


    let enrollmentStatus = null;


    // Check only for logged-in students
    if (req.user) {

      const enrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId: course._id,
      });


      if (enrollment) {

        enrollmentStatus = enrollment.status;

      }

    }


    res.json({

      ...course.toObject(),

      enrollmentStatus,

    });


  } catch (error) {

    res.status(500).json({

      message: error.message,

    });

  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (req.body.title !== undefined) {
      course.title = req.body.title;
    }

    if (req.body.description !== undefined) {
      course.description = req.body.description;
    }

    if (req.body.price !== undefined) {
      course.price = req.body.price;
    }

    if (req.body.thumbnail !== undefined) {
      course.thumbnail = req.body.thumbnail;
    }

    if (req.body.category !== undefined) {
      course.category = req.body.category;
    }

    // Update assigned mentor
    if (req.body.mentor !== undefined) {
      course.mentor = req.body.mentor;
    }

    const updatedCourse = await course.save();

    res.json(updatedCourse);
  } catch (error) {
    console.error("Update Course Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    await course.deleteOne();

    res.json({
      message: "Course deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
