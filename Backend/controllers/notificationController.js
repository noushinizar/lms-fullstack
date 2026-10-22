
import Notification from "../models/Notification.js";
import { generateFollowUpReminders } from "../services/notificationService.js";

// Admin-only endpoint to generate reminders during testing.
export const runFollowUpReminders = async (req, res) => {
  try {
    const result = await generateFollowUpReminders();

    return res.status(200).json({
      success: true,
      message: "Follow-up reminders generated successfully.",
      results: result,
    });
  } catch (error) {
    console.error("Generate follow-up reminders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate follow-up reminders.",
    });
  }
};

// Get notifications for the logged-in user.
export const getMyNotifications = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20),
    );

    const filter = {
      recipient: req.user._id,
    };

    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find(filter)
        .populate("lead", "name phone status")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Notification.countDocuments({
        ...filter,
        isRead: false,
      }),

      Notification.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
};

// Mark one of the logged-in user's notifications as read.
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    );

    if (notification) {
      return res.status(200).json({
        success: true,
        message: "Notification marked as read.",
        notification,
      });
    }

    // Distinguish an already-read notification from a missing
    // notification, without exposing another user's records.
    const existing = await Notification.exists({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Notification is already read.",
      });
    }

    return res.status(404).json({
      success: false,
      message: "Notification not found.",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    console.error("Mark notification read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
};

// Mark all notifications belonging to the logged-in user as read.
export const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
    });
  }
};
