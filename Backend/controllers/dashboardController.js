import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

export const getDashboardStats = async (req, res) => {
  try {
    
    // Dashboard Statistics
   

    const totalStudents = await User.countDocuments({
      role: "student",
    });

    const totalMentors = await User.countDocuments({
      role: "mentor",
    });

    const totalCourses = await Course.countDocuments();

    const totalEnrollments = await Enrollment.countDocuments();

  
    // Recent Enrollments
    

    const recentEnrollments = await Enrollment.find()
      .populate("studentId", "name")
      .populate("courseId", "title")
      .sort({ createdAt: -1 })
      .limit(5);


    // Latest Courses
   

    const latestCourses = await Course.find()
      .populate("mentor", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    
    // Platform Activity
   

    // Recent Students
    const recentStudents = await User.find({
      role: "student",
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent Mentors
    const recentMentors = await User.find({
      role: "mentor",
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Course Activities
    const courseActivities = latestCourses.map((course) => ({
      type: "course",
      title: `New course "${course.title}" was created`,
      date: course.createdAt,
    }));

    // Enrollment Activities
    const enrollmentActivities = recentEnrollments.map((enrollment) => ({
      type: "enrollment",
      title: `${enrollment.studentId?.name} enrolled in "${enrollment.courseId?.title}"`,
      date: enrollment.createdAt,
    }));

    // Student Activities
    const studentActivities = recentStudents.map((student) => ({
      type: "student",
      title: `${student.name} joined as Student`,
      date: student.createdAt,
    }));

    // Mentor Activities
    const mentorActivities = recentMentors.map((mentor) => ({
      type: "mentor",
      title: `${mentor.name} joined as Mentor`,
      date: mentor.createdAt,
    }));

    // Merge All Activities
    const platformActivity = [
      ...courseActivities,
      ...enrollmentActivities,
      ...studentActivities,
      ...mentorActivities,
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

   

    res.json({
      totalStudents,
      totalMentors,
      totalCourses,
      totalEnrollments,
      recentEnrollments,
      latestCourses,
      platformActivity,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};