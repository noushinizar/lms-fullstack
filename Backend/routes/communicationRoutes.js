import express from "express";

import {
  createAnnouncement,
  createLiveClass,
  getAnnouncements,
  getLiveClasses,
  joinLiveClass,
} from "../controllers/communicationController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/announcement",
  protect,
  authorizeRoles("admin", "mentor"),
  createAnnouncement,
);

router.post(
  "/liveclass",
  protect,
  authorizeRoles("admin", "mentor"),
  createLiveClass,
);

router.get("/announcement/:courseId", protect, getAnnouncements);

router.get("/liveclass/:courseId", protect, getLiveClasses);

router.get("/join/:id", protect, joinLiveClass);

export default router;
