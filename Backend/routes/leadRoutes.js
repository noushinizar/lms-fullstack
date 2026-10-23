import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import multer from "multer";

import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getFollowUps,
  createFollowUp,
  getLeadActivities,
  importLeads,
  convertLeadToStudent,
  getCounselorWorkload,
  getLeadReportOverview,
  getLeadSourceReport
} from "../controllers/leadController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const fileName = file.originalname.toLowerCase();

    if (!fileName.endsWith(".csv") && !fileName.endsWith(".xlsx")) {
      return callback(new Error("Only CSV and XLSX files are supported."));
    }

    callback(null, true);
  },
});

const uploadLeadSpreadsheet = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error) {
      const isTooLarge = error.code === "LIMIT_FILE_SIZE";

      return res.status(isTooLarge ? 413 : 400).json({
        message: isTooLarge
          ? "File size must not exceed 2 MB."
          : error.message || "Unable to upload the file.",
      });
    }

    next();
  });
};

const crmRoles = ["admin", "admission_counselor"];

// All lead routes require authentication and an authorized CRM role.
router.use(protect, authorizeRoles(...crmRoles));

router.route("/").get(getLeads).post(createLead);

router.get(
  "/dashboard/workload",
  getCounselorWorkload,
);

router.post("/import", uploadLeadSpreadsheet, importLeads);

router.post("/:id/convert", convertLeadToStudent);

router.get("/reports/overview", getLeadReportOverview);

router.get("/reports/sources", getLeadSourceReport);

router.route("/:id").get(getLeadById).put(updateLead);

// Only admins can delete leads.
router.delete("/:id", authorizeRoles("admin"), deleteLead);

router.get("/:leadId/follow-ups", getFollowUps);

router.post("/:leadId/follow-ups", createFollowUp);

router.get("/:leadId/activities", getLeadActivities);

export default router;
