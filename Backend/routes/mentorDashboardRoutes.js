import express from "express";
import { getMentorDashboard } from "../controllers/mentorDashboardController.js";
import protect  from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js"

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles("mentor"),
  getMentorDashboard
);
export default router;