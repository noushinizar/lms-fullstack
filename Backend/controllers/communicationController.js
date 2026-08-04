import Announcement from "../models/Announcement.js";
import LiveClass from "../models/LiveClass.js";

export const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({
      courseId: req.body.courseId,
      title: req.body.title,
      message: req.body.message,
      createdBy: req.user._id,
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.create({
      courseId: req.body.courseId,
      title: req.body.title,
      meetingLink: req.body.meetingLink,
      scheduledDate: req.body.scheduledDate,
      createdBy: req.user._id,
    });

    res.status(201).json(liveClass);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      courseId: req.params.courseId,
    });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getLiveClasses = async (req, res) => {
  try {
    const liveClasses = await LiveClass.find({
      courseId: req.params.courseId,
    });

    res.json(liveClasses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const joinLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);

    if (!liveClass) {
      return res.status(404).json({
        message: "Live class not found",
      });
    }

    res.json({
      message: "Joining class",

      meetingLink: liveClass.meetingLink,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
