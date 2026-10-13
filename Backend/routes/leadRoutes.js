
import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
} from "../controllers/leadController.js";

const router = express.Router();

const crmRoles = ["admin", "admission_counselor"];

// All lead routes require authentication and an authorized CRM role.
router.use(protect, authorizeRoles(...crmRoles));

router
  .route("/")
  .get(getLeads)
  .post(createLead);

router
  .route("/:id")
  .get(getLeadById)
  .put(updateLead);

// Only admins can delete leads.
router.delete(
  "/:id",
  authorizeRoles("admin"),
  deleteLead,
);

export default router;
