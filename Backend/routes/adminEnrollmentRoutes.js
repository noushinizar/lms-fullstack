import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import {
  getEnrollmentRequests,
  approveEnrollment,
  rejectEnrollment,
} from "../controllers/adminEnrollmentController.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/", getEnrollmentRequests);

router.put("/:id/approve", approveEnrollment);

router.put("/:id/reject", rejectEnrollment);

export default router;