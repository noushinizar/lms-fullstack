
import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import {
  runFollowUpReminders,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// All notification routes require login.
router.use(protect);

// Get notifications for the logged-in user.
router.get("/", getMyNotifications);

// Mark all notifications as read.
router.patch("/read-all", markAllNotificationsRead);

// Mark one notification as read.
router.patch("/:id/read", markNotificationRead);

// Admin-only endpoint for testing reminder generation.
router.post(
  "/run-reminders",
  authorizeRoles("admin"),
  runFollowUpReminders
);

export default router;
