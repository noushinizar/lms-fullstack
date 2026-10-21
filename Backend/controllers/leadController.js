import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import FollowUp from "../models/FollowUp.js";
import LeadActivity from "../models/LeadActivity.js";
import ExcelJS from "exceljs";
import { Readable } from "node:stream";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import Enrollment from "../models/Enrollment.js";
// ============================================================
// CONSTANTS
// ============================================================

const leadStatuses = [
  "new",
  "contacted",
  "interested",
  "follow-up",
  "converted",
  "lost",
];

const leadSources = [
  "website",
  "phone",
  "walk-in",
  "referral",
  "meta-ads",
  "other",
];

const followUpTypes = ["call", "whatsapp", "meeting", "email", "other"];

const followUpOutcomes = [
  "interested",
  "no-answer",
  "callback-requested",
  "not-interested",
  "enrolled",
  "other",
];

const isAdmin = (req) => req.user?.role === "admin";

const isValidId = (id) =>
  (typeof id === "string" || id instanceof mongoose.Types.ObjectId) &&
  mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeEmail = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const normalizePhone = (value) => String(value ?? "").replace(/\D/g, "");

const validatePhone = (value) => {
  if (typeof value !== "string") return false;

  const phone = value.trim();

  if (!phone || phone.length > 20) return false;

  // Accept an optional leading +, spaces, parentheses, dots and hyphens.
  if (!/^\+?[\d\s().-]+$/.test(phone)) return false;

  const digits = normalizePhone(phone);

  return digits.length >= 7 && digits.length <= 15;
};

const validateEmail = (value) =>
  typeof value === "string" &&
  value.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const parseOptionalDate = (value) => {
  if (value === undefined || value === null || value === "") {
    return { valid: true, value: null };
  }

  const parsed = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return { valid: false, value: null };
  }

  return { valid: true, value: parsed };
};

const normalizeHeader = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

// ============================================================
// AUDIT LABEL HELPERS
// ============================================================

const getCourseLabel = async (courseId, session = null) => {
  if (!courseId || !isValidId(courseId)) return null;

  let query = Course.findById(courseId).select("title name");

  if (session) query = query.session(session);

  const course = await query;

  return course ? course.title || course.name || "Unnamed course" : null;
};

const getCounselorLabel = async (counselorId, session = null) => {
  if (!counselorId || !isValidId(counselorId)) return null;

  let query = User.findById(counselorId).select("name email");

  if (session) query = query.session(session);

  const counselor = await query;

  return counselor
    ? counselor.name || counselor.email || "Unnamed counselor"
    : null;
};

const getFieldLabel = async (field, value, session = null) => {
  if (value === null || value === undefined || value === "") return null;

  if (field === "interestedCourse") {
    return getCourseLabel(value, session);
  }

  if (field === "assignedCounselor") {
    return getCounselorLabel(value, session);
  }

  if (field === "followUpDate") {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
  }

  return String(value);
};

const createAuditChange = async (field, oldValue, newValue, session = null) => {
  const oldLabel = await getFieldLabel(field, oldValue, session);
  const newLabel = await getFieldLabel(field, newValue, session);

  return {
    field,
    oldValue: oldValue ?? null,
    newValue: newValue ?? null,
    oldLabel,
    newLabel,
  };
};

const logLeadActivity = async ({
  leadId,
  userId,
  action,
  description,
  changes = [],
  session = null,
}) => {
  const activity = {
    lead: leadId,
    performedBy: userId,
    action,
    description,
    changes,
  };

  if (session) {
    const [created] = await LeadActivity.create([activity], { session });
    return created;
  }

  return LeadActivity.create(activity);
};

// ============================================================
// VALIDATION HELPERS
// ============================================================

const validateCourse = async (courseId) => {
  if (courseId === undefined || courseId === null || courseId === "") {
    return { valid: true, value: null };
  }

  if (!isValidId(courseId)) return { valid: false };

  const course = await Course.findById(courseId).select("_id");

  return course ? { valid: true, value: course._id } : { valid: false };
};

const validateCounselor = async (counselorId) => {
  if (counselorId === undefined || counselorId === null || counselorId === "") {
    return { valid: true, value: null };
  }

  if (!isValidId(counselorId)) return { valid: false };

  const counselor = await User.findOne({
    _id: counselorId,
    role: "admission_counselor",
  }).select("_id");

  return counselor ? { valid: true, value: counselor._id } : { valid: false };
};

// ============================================================
// CREATE LEAD
// ============================================================

export const createLead = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      interestedCourse,
      source,
      status,
      assignedCounselor,
      followUpDate,
      notes,
    } = req.body;

    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
      return res.status(400).json({
        message: "A valid lead name is required (maximum 100 characters).",
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        message: "Enter a valid phone number containing 7 to 15 digits.",
      });
    }

    if (email !== undefined && email !== null && typeof email !== "string") {
      return res.status(400).json({ message: "Invalid email address." });
    }

    const normalizedEmail = normalizeEmail(email);

    if (normalizedEmail && !validateEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    if (source !== undefined && !leadSources.includes(source)) {
      return res.status(400).json({ message: "Invalid lead source." });
    }

    if (status !== undefined && !leadStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid lead status." });
    }

    if (
      notes !== undefined &&
      (typeof notes !== "string" || notes.length > 5000)
    ) {
      return res.status(400).json({
        message: "Notes cannot exceed 5000 characters.",
      });
    }

    const dateResult = parseOptionalDate(followUpDate);

    if (!dateResult.valid) {
      return res.status(400).json({ message: "Invalid follow-up date." });
    }

    const courseResult = await validateCourse(interestedCourse);

    if (!courseResult.valid) {
      return res.status(400).json({
        message: "The selected course does not exist or is invalid.",
      });
    }

    let counselorId = null;

    if (isAdmin(req)) {
      const counselorResult = await validateCounselor(assignedCounselor);

      if (!counselorResult.valid) {
        return res.status(400).json({
          message: "The selected admission counselor is invalid.",
        });
      }

      counselorId = counselorResult.value;
    } else {
      // A counselor creating a lead can only assign it to themselves.
      counselorId = req.user._id;
    }

    const lead = await Lead.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      interestedCourse: courseResult.value,
      source: source || "other",
      status: status || "new",
      assignedCounselor: counselorId,
      followUpDate: dateResult.value,
      notes: notes?.trim() || "",
      createdBy: req.user._id,
    });

    const initialChanges = [
      await createAuditChange("status", null, lead.status),
      await createAuditChange(
        "interestedCourse",
        null,
        lead.interestedCourse ? String(lead.interestedCourse) : null,
      ),
      await createAuditChange(
        "assignedCounselor",
        null,
        lead.assignedCounselor ? String(lead.assignedCounselor) : null,
      ),
    ];

    await logLeadActivity({
      leadId: lead._id,
      userId: req.user._id,
      action: "lead_created",
      description: `Lead "${lead.name}" was created.`,
      changes: initialChanges,
    });

    return res.status(201).json({
      message: "Lead created successfully.",
      lead,
    });
  } catch (error) {
    console.error("Create lead error:", error);

    return res.status(500).json({ message: "Unable to create lead." });
  }
};

// ============================================================
// GET AND FILTER LEADS
// ============================================================

export const getLeads = async (req, res) => {
  try {
    const { search, status, source, assignedCounselor } = req.query;
    const filter = {};

    if (isAdmin(req)) {
      if (assignedCounselor) {
        if (!isValidId(assignedCounselor)) {
          return res.status(400).json({ message: "Invalid counselor ID." });
        }

        filter.assignedCounselor = assignedCounselor;
      }
    } else {
      filter.assignedCounselor = req.user._id;
    }

    if (status) {
      if (!leadStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid lead status." });
      }

      filter.status = status;
    }

    if (source) {
      if (!leadSources.includes(source)) {
        return res.status(400).json({ message: "Invalid lead source." });
      }

      filter.source = source;
    }

    if (search && search.trim()) {
      const expression = new RegExp(escapeRegex(search.trim()), "i");

      filter.$or = [
        { name: expression },
        { email: expression },
        { phone: expression },
      ];
    }

    const leads = await Lead.find(filter)
      .populate("interestedCourse", "title name")
      .populate("assignedCounselor", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error("Get leads error:", error);

    return res.status(500).json({ message: "Unable to retrieve leads." });
  }
};

// ============================================================
// GET ONE LEAD
// ============================================================

export const getLeadById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid lead ID." });
    }

    const lead = await Lead.findById(req.params.id)
      .populate("interestedCourse", "title name")
      .populate("assignedCounselor", "name email")
      .populate("createdBy", "name email");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }

    if (
      !isAdmin(req) &&
      String(lead.assignedCounselor?._id || lead.assignedCounselor) !==
        String(req.user._id)
    ) {
      return res.status(403).json({
        message: "You cannot access this lead.",
      });
    }

    return res.status(200).json({ lead });
  } catch (error) {
    console.error("Get lead error:", error);

    return res.status(500).json({ message: "Unable to retrieve lead." });
  }
};

// ============================================================
// UPDATE LEAD
// ============================================================

export const updateLead = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid lead ID." });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }

    if (
      !isAdmin(req) &&
      String(lead.assignedCounselor) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "You cannot update this lead." });
    }

    const previousValues = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      interestedCourse: lead.interestedCourse
        ? String(lead.interestedCourse)
        : null,
      source: lead.source,
      status: lead.status,
      assignedCounselor: lead.assignedCounselor
        ? String(lead.assignedCounselor)
        : null,
      followUpDate: lead.followUpDate
        ? new Date(lead.followUpDate).toISOString()
        : null,
      notes: lead.notes,
    };

    const {
      name,
      email,
      phone,
      interestedCourse,
      source,
      status,
      assignedCounselor,
      followUpDate,
      notes,
    } = req.body;

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim() ||
        name.trim().length > 100
      ) {
        return res.status(400).json({ message: "Invalid lead name." });
      }

      lead.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string") {
        return res.status(400).json({ message: "Invalid email address." });
      }

      const normalizedEmail = normalizeEmail(email);

      if (normalizedEmail && !validateEmail(normalizedEmail)) {
        return res.status(400).json({ message: "Invalid email address." });
      }

      lead.email = normalizedEmail;
    }

    if (phone !== undefined) {
      if (!validatePhone(phone)) {
        return res.status(400).json({
          message: "Enter a valid phone number containing 7 to 15 digits.",
        });
      }

      lead.phone = phone.trim();
    }

    if (interestedCourse !== undefined) {
      const result = await validateCourse(interestedCourse);

      if (!result.valid) {
        return res.status(400).json({
          message: "The selected course does not exist or is invalid.",
        });
      }

      lead.interestedCourse = result.value;
    }

    if (source !== undefined) {
      if (!leadSources.includes(source)) {
        return res.status(400).json({ message: "Invalid lead source." });
      }

      lead.source = source;
    }

    if (status !== undefined) {
      if (!leadStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid lead status." });
      }

      lead.status = status;
    }

    if (followUpDate !== undefined) {
      const result = parseOptionalDate(followUpDate);

      if (!result.valid) {
        return res.status(400).json({ message: "Invalid follow-up date." });
      }

      lead.followUpDate = result.value;
    }

    if (notes !== undefined) {
      if (typeof notes !== "string" || notes.length > 5000) {
        return res.status(400).json({
          message: "Notes cannot exceed 5000 characters.",
        });
      }

      lead.notes = notes.trim();
    }

    if (isAdmin(req) && assignedCounselor !== undefined) {
      const result = await validateCounselor(assignedCounselor);

      if (!result.valid) {
        return res.status(400).json({
          message: "The selected admission counselor is invalid.",
        });
      }

      lead.assignedCounselor = result.value;
    }

    await lead.save();

    const fieldsToTrack = [
      "name",
      "email",
      "phone",
      "interestedCourse",
      "source",
      "status",
      "assignedCounselor",
      "followUpDate",
      "notes",
    ];

    const changes = [];

    for (const field of fieldsToTrack) {
      let newValue = lead[field];

      if (field === "interestedCourse" || field === "assignedCounselor") {
        newValue = newValue ? String(newValue) : null;
      }

      if (field === "followUpDate") {
        newValue = newValue ? new Date(newValue).toISOString() : null;
      }

      if (previousValues[field] === newValue) continue;

      changes.push(
        await createAuditChange(
          field,
          previousValues[field] ?? null,
          newValue ?? null,
        ),
      );
    }

    if (changes.length > 0) {
      const statusChanged = changes.some((item) => item.field === "status");
      const counselorChanged = changes.some(
        (item) => item.field === "assignedCounselor",
      );

      const action = statusChanged
        ? "status_changed"
        : counselorChanged
          ? "counselor_reassigned"
          : "lead_updated";

      const description = statusChanged
        ? `Lead status changed from "${previousValues.status}" to "${lead.status}".`
        : counselorChanged
          ? "Lead counselor assignment changed."
          : `Lead details updated: ${changes
              .map((item) => item.field)
              .join(", ")}.`;

      await logLeadActivity({
        leadId: lead._id,
        userId: req.user._id,
        action,
        description,
        changes,
      });
    }

    return res.status(200).json({
      message: "Lead updated successfully.",
      lead,
    });
  } catch (error) {
    console.error("Update lead error:", error);

    return res.status(500).json({ message: "Unable to update lead." });
  }
};

// ============================================================
// DELETE LEAD — ADMIN ONLY
// ============================================================

export const deleteLead = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message: "Only administrators can delete leads.",
      });
    }

    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid lead ID." });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }

    await lead.deleteOne();

    return res.status(200).json({
      message: "Lead deleted successfully.",
    });
  } catch (error) {
    console.error("Delete lead error:", error);

    return res.status(500).json({ message: "Unable to delete lead." });
  }
};

// ============================================================
// ACCESS CONTROL HELPER
// ============================================================

const getAccessibleLead = async (leadId, user) => {
  if (!isValidId(leadId)) return { error: "invalid-id" };

  const lead = await Lead.findById(leadId);

  if (!lead) return { error: "not-found" };

  if (
    user.role !== "admin" &&
    String(lead.assignedCounselor) !== String(user._id)
  ) {
    return { error: "forbidden" };
  }

  return { lead };
};

// ============================================================
// RESOLVE OLD ACTIVITY LABELS
// ============================================================

const resolveActivityLabels = async (activities) => {
  const courseIds = new Set();
  const counselorIds = new Set();

  for (const activity of activities) {
    for (const change of activity.changes || []) {
      if (
        change.field !== "interestedCourse" &&
        change.field !== "assignedCounselor"
      ) {
        continue;
      }

      for (const value of [change.oldValue, change.newValue]) {
        if (!value || !isValidId(value)) continue;

        if (change.field === "interestedCourse") {
          courseIds.add(String(value));
        } else {
          counselorIds.add(String(value));
        }
      }
    }
  }

  const [courses, counselors] = await Promise.all([
    courseIds.size
      ? Course.find({ _id: { $in: [...courseIds] } }).select("_id title name")
      : [],
    counselorIds.size
      ? User.find({ _id: { $in: [...counselorIds] } }).select("_id name email")
      : [],
  ]);

  const courseNames = new Map(
    courses.map((course) => [
      String(course._id),
      course.title || course.name || "Unnamed course",
    ]),
  );

  const counselorNames = new Map(
    counselors.map((counselor) => [
      String(counselor._id),
      counselor.name || counselor.email || "Unnamed counselor",
    ]),
  );

  return activities.map((activity) => {
    const item =
      typeof activity.toObject === "function"
        ? activity.toObject()
        : { ...activity };

    item.changes = (item.changes || []).map((change) => {
      const updated = { ...change };

      if (updated.field === "interestedCourse") {
        updated.oldLabel =
          updated.oldLabel ??
          courseNames.get(String(updated.oldValue)) ??
          (updated.oldValue ? "Course no longer available" : null);

        updated.newLabel =
          updated.newLabel ??
          courseNames.get(String(updated.newValue)) ??
          (updated.newValue ? "Course no longer available" : null);
      }

      if (updated.field === "assignedCounselor") {
        updated.oldLabel =
          updated.oldLabel ??
          counselorNames.get(String(updated.oldValue)) ??
          (updated.oldValue ? "Counselor no longer available" : null);

        updated.newLabel =
          updated.newLabel ??
          counselorNames.get(String(updated.newValue)) ??
          (updated.newValue ? "Counselor no longer available" : null);
      }

      return updated;
    });

    return item;
  });
};

// ============================================================
// GET LEAD ACTIVITIES
// ============================================================

export const getLeadActivities = async (req, res) => {
  try {
    const result = await getAccessibleLead(req.params.leadId, req.user);

    if (result.error === "invalid-id") {
      return res.status(400).json({
        success: false,
        message: "Invalid lead ID.",
      });
    }

    if (result.error === "not-found") {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    if (result.error === "forbidden") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this lead's activity.",
      });
    }

    const activities = await LeadActivity.find({
      lead: result.lead._id,
    })
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const resolvedActivities = await resolveActivityLabels(activities);

    return res.status(200).json({
      success: true,
      count: resolvedActivities.length,
      activities: resolvedActivities,
    });
  } catch (error) {
    console.error("Get Lead Activities Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch lead activity history.",
    });
  }
};

// ============================================================
// GET FOLLOW-UP HISTORY
// ============================================================

export const getFollowUps = async (req, res) => {
  try {
    const result = await getAccessibleLead(req.params.leadId, req.user);

    if (result.error === "invalid-id") {
      return res.status(400).json({ message: "Invalid lead ID." });
    }

    if (result.error === "not-found") {
      return res.status(404).json({ message: "Lead not found." });
    }

    if (result.error === "forbidden") {
      return res.status(403).json({
        message: "You cannot access this lead's follow-up history.",
      });
    }

    const followUps = await FollowUp.find({
      lead: result.lead._id,
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: followUps.length,
      followUps,
    });
  } catch (error) {
    console.error("Get follow-up history error:", error);

    return res.status(500).json({
      message: "Unable to retrieve follow-up history.",
    });
  }
};

// ============================================================
// CREATE FOLLOW-UP AND AUDIT ENTRY ATOMICALLY
// ============================================================

export const createFollowUp = async (req, res) => {
  try {
    const result = await getAccessibleLead(req.params.leadId, req.user);

    if (result.error === "invalid-id") {
      return res.status(400).json({ message: "Invalid lead ID." });
    }

    if (result.error === "not-found") {
      return res.status(404).json({ message: "Lead not found." });
    }

    if (result.error === "forbidden") {
      return res.status(403).json({
        message: "You cannot add follow-ups to this lead.",
      });
    }

    const { type, outcome, notes, nextFollowUpDate } = req.body;

    if (!followUpTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid follow-up type." });
    }

    if (outcome !== undefined && !followUpOutcomes.includes(outcome)) {
      return res.status(400).json({ message: "Invalid follow-up outcome." });
    }

    if (
      notes !== undefined &&
      (typeof notes !== "string" || notes.length > 5000)
    ) {
      return res.status(400).json({
        message: "Follow-up notes cannot exceed 5000 characters.",
      });
    }

    const dateResult = parseOptionalDate(nextFollowUpDate);

    if (!dateResult.valid) {
      return res.status(400).json({
        message: "Invalid next follow-up date.",
      });
    }

    const session = await mongoose.startSession();
    let followUpId;

    try {
      await session.withTransaction(async () => {
        const lead = await Lead.findById(result.lead._id).session(session);

        if (!lead) {
          const error = new Error("Lead not found.");
          error.statusCode = 404;
          throw error;
        }

        if (
          !isAdmin(req) &&
          String(lead.assignedCounselor) !== String(req.user._id)
        ) {
          const error = new Error("You cannot add follow-ups to this lead.");
          error.statusCode = 403;
          throw error;
        }

        const [followUp] = await FollowUp.create(
          [
            {
              lead: lead._id,
              type,
              outcome: outcome || "other",
              notes: notes?.trim() || "",
              nextFollowUpDate: dateResult.value,
              createdBy: req.user._id,
            },
          ],
          { session },
        );

        followUpId = followUp._id;

        const changes = [
          {
            field: "followUpType",
            oldValue: null,
            newValue: type,
            oldLabel: null,
            newLabel: type,
          },
          {
            field: "followUpOutcome",
            oldValue: null,
            newValue: outcome || "other",
            oldLabel: null,
            newLabel: outcome || "other",
          },
        ];

        if (nextFollowUpDate !== undefined) {
          const oldDate = lead.followUpDate
            ? new Date(lead.followUpDate).toISOString()
            : null;

          lead.followUpDate = dateResult.value;
          await lead.save({ session });

          const newDate = lead.followUpDate
            ? new Date(lead.followUpDate).toISOString()
            : null;

          if (oldDate !== newDate) {
            changes.push(
              await createAuditChange(
                "followUpDate",
                oldDate,
                newDate,
                session,
              ),
            );
          }
        }

        await logLeadActivity({
          leadId: lead._id,
          userId: req.user._id,
          action: "follow_up_added",
          description: `A ${type} follow-up was recorded (${outcome || "other"}).`,
          changes,
          session,
        });
      });
    } finally {
      await session.endSession();
    }

    const followUp = await FollowUp.findById(followUpId).populate(
      "createdBy",
      "name email",
    );

    return res.status(201).json({
      message: "Follow-up recorded successfully.",
      followUp,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error("Create follow-up error:", error);

    return res.status(500).json({
      message: "Unable to record follow-up.",
    });
  }
};

// ============================================================
// IMPORT LEADS FROM CSV / XLSX
// ============================================================

export const importLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a CSV or Excel file.",
      });
    }

    const fileName = String(req.file.originalname || "").toLowerCase();

    if (!fileName.endsWith(".csv") && !fileName.endsWith(".xlsx")) {
      return res.status(400).json({
        message: "Only CSV and XLSX files are supported.",
      });
    }

    const workbook = new ExcelJS.Workbook();

    if (fileName.endsWith(".csv")) {
      const csvText = req.file.buffer.toString("utf8").replace(/^\uFEFF/, "");

      const rows = await new Promise((resolve, reject) => {
        const parsedRows = [];
        const parserStream = Readable.from([csvText]);

        import("csv-parse")
          .then(({ parse }) => {
            parserStream
              .pipe(
                parse({
                  bom: true,
                  skip_empty_lines: true,
                  trim: true,
                }),
              )
              .on("data", (row) => parsedRows.push(row))
              .on("error", reject)
              .on("end", () => resolve(parsedRows));
          })
          .catch(reject);
      });

      const csvWorksheet = workbook.addWorksheet("Leads");

      rows.forEach((values) => csvWorksheet.addRow(values));
    } else {
      await workbook.xlsx.load(req.file.buffer);
    }

    const worksheet = workbook.worksheets[0];

    if (!worksheet || worksheet.rowCount < 2) {
      return res.status(400).json({
        message:
          "The spreadsheet must contain a header row and at least one lead.",
      });
    }

    const headerRow = worksheet.getRow(1);
    const headers = [];

    // ExcelJS column numbers start at 1. Preserve those indices.
    headerRow.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      headers[columnNumber] = normalizeHeader(cell.text || cell.value);
    });

    const requiredColumns = ["name", "phone"];

    const allowedColumns = [
      "name",
      "phone",
      "email",
      "interestedcourse",
      "source",
      "status",
      "followupdate",
      "notes",
      "assignedcounselor",
    ];

    const actualHeaders = headers.filter(Boolean);

    const missingColumns = requiredColumns.filter(
      (column) => !actualHeaders.includes(column),
    );

    const unknownColumns = [
      ...new Set(
        actualHeaders.filter((header) => !allowedColumns.includes(header)),
      ),
    ];

    const headerCounts = new Map();

    for (const header of actualHeaders) {
      headerCounts.set(header, (headerCounts.get(header) || 0) + 1);
    }

    const duplicateColumns = [...headerCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([header]) => header);

    if (
      missingColumns.length > 0 ||
      unknownColumns.length > 0 ||
      duplicateColumns.length > 0
    ) {
      const errors = [];

      if (missingColumns.length > 0) {
        errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
      }

      if (unknownColumns.length > 0) {
        errors.push(`Unrecognized columns: ${unknownColumns.join(", ")}`);
      }

      if (duplicateColumns.length > 0) {
        errors.push(`Duplicate columns: ${duplicateColumns.join(", ")}`);
      }

      return res.status(400).json({ message: errors.join(". ") });
    }

    const dataRowCount = worksheet.rowCount - 1;

    if (dataRowCount > 500) {
      return res.status(400).json({
        message: "You can import a maximum of 500 lead rows at a time.",
      });
    }

    // Find the real Excel column number; do not subtract 1.
    const getColumnIndex = (columnName) =>
      headers.findIndex((header) => header === normalizeHeader(columnName));

    const getCellValue = (row, columnName) => {
      const columnIndex = getColumnIndex(columnName);

      if (columnIndex === -1) return null;

      return row.getCell(columnIndex).value;
    };

    const getValue = (row, columnName) => {
      const value = getCellValue(row, columnName);

      if (value === null || value === undefined) return "";

      if (value instanceof Date) return value;

      if (typeof value === "object") {
        if ("text" in value) return String(value.text ?? "").trim();

        if ("result" in value) {
          return String(value.result ?? "").trim();
        }

        if ("richText" in value && Array.isArray(value.richText)) {
          return value.richText
            .map((item) => item.text || "")
            .join("")
            .trim();
        }

        return "";
      }

      return String(value).trim();
    };

    const validSources = leadSources;
    const validStatuses = leadStatuses;

    const [existingLeads, courses, counselors] = await Promise.all([
      Lead.find({}, "name phone email").lean(),
      Course.find({}).lean(),
      isAdmin(req)
        ? User.find({ role: "admission_counselor" }, "name email").lean()
        : Promise.resolve([]),
    ]);

    const existingPhones = new Set(
      existingLeads.map((lead) => normalizePhone(lead.phone)).filter(Boolean),
    );

    const existingEmails = new Set(
      existingLeads.map((lead) => normalizeEmail(lead.email)).filter(Boolean),
    );

    const courseByName = new Map();

    for (const course of courses) {
      const courseName = String(course.title || course.name || "")
        .trim()
        .toLowerCase();

      if (!courseName) continue;

      if (!courseByName.has(courseName)) {
        courseByName.set(courseName, []);
      }

      courseByName.get(courseName).push(course);
    }

    const counselorByName = new Map();

    for (const counselor of counselors) {
      for (const value of [counselor.name, counselor.email]) {
        const key = String(value || "")
          .trim()
          .toLowerCase();

        if (!key) continue;

        if (!counselorByName.has(key)) {
          counselorByName.set(key, []);
        }

        counselorByName.get(key).push(counselor);
      }
    }

    const results = {
      totalRows: 0,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);

      const hasData = row.values
        .slice(1)
        .some((value) => value !== null && value !== undefined && value !== "");

      if (!hasData) continue;

      results.totalRows++;

      try {
        const name = String(getValue(row, "name")).trim();
        const phone = String(getValue(row, "phone")).trim();
        const email = normalizeEmail(getValue(row, "email"));

        const sourceInput = String(getValue(row, "source") || "other")
          .trim()
          .toLowerCase();

        const statusInput = String(getValue(row, "status") || "new")
          .trim()
          .toLowerCase();

        if (!name || name.length > 100) {
          throw new Error(
            "Name is required and must be at most 100 characters.",
          );
        }

        if (!validatePhone(phone)) {
          throw new Error(
            "Phone number must contain 7 to 15 digits and only valid phone characters.",
          );
        }

        const normalizedPhone = normalizePhone(phone);

        if (email && !validateEmail(email)) {
          throw new Error("Please provide a valid email address.");
        }

        if (!validSources.includes(sourceInput)) {
          throw new Error(`Invalid source: ${sourceInput}`);
        }

        if (!validStatuses.includes(statusInput)) {
          throw new Error(`Invalid status: ${statusInput}`);
        }

        if (
          existingPhones.has(normalizedPhone) ||
          (email && existingEmails.has(email))
        ) {
          results.skipped++;

          results.errors.push({
            row: rowNumber,
            reason: "Duplicate phone number or email address.",
          });

          continue;
        }

        let interestedCourse = null;
        const courseInput = String(getValue(row, "interestedCourse")).trim();

        if (courseInput) {
          const matches = courseByName.get(courseInput.toLowerCase()) || [];

          if (matches.length !== 1) {
            throw new Error(
              matches.length === 0
                ? `Course not found: ${courseInput}`
                : `Course name is ambiguous: ${courseInput}`,
            );
          }

          interestedCourse = matches[0]._id;
        }

        let assignedCounselor = null;

        const counselorInput = String(
          getValue(row, "assignedCounselor"),
        ).trim();

        if (counselorInput && !isAdmin(req)) {
          throw new Error("Only admins can assign leads to counselors.");
        }

        if (counselorInput && isAdmin(req)) {
          const matches =
            counselorByName.get(counselorInput.toLowerCase()) || [];

          if (matches.length !== 1) {
            throw new Error(
              matches.length === 0
                ? `Counselor not found: ${counselorInput}`
                : `Counselor name/email is ambiguous: ${counselorInput}`,
            );
          }

          assignedCounselor = matches[0]._id;
        } else if (!isAdmin(req)) {
          assignedCounselor = req.user._id;
        }

        let followUpDate = null;

        const rawFollowUpValue = getCellValue(row, "followUpDate");
        const followUpInput = getValue(row, "followUpDate");

        if (followUpInput !== "") {
          let parsedDate;

          if (rawFollowUpValue instanceof Date) {
            parsedDate = rawFollowUpValue;
          } else if (
            typeof rawFollowUpValue === "number" &&
            fileName.endsWith(".xlsx")
          ) {
            parsedDate = new Date(
              Date.UTC(1899, 11, 30) + rawFollowUpValue * 24 * 60 * 60 * 1000,
            );
          } else {
            parsedDate = new Date(String(followUpInput).trim());
          }

          if (Number.isNaN(parsedDate.getTime())) {
            throw new Error("Invalid followUpDate.");
          }

          followUpDate = parsedDate;
        }

        const notes = String(getValue(row, "notes") ?? "").trim();

        if (notes.length > 5000) {
          throw new Error("Notes must be at most 5000 characters.");
        }

        const lead = await Lead.create({
          name,
          phone,
          email,
          interestedCourse,
          source: sourceInput,
          status: statusInput,
          assignedCounselor,
          followUpDate,
          notes,
          createdBy: req.user._id,
        });

        await logLeadActivity({
          leadId: lead._id,
          userId: req.user._id,
          action: "lead_created",
          description: "Lead imported from spreadsheet.",
        });

        // Track newly imported records to catch duplicates within this file.
        existingPhones.add(normalizedPhone);

        if (email) existingEmails.add(email);

        results.imported++;
      } catch (error) {
        results.failed++;

        results.errors.push({
          row: rowNumber,
          reason: error.message || "Unable to import this row.",
        });
      }
    }

    return res.status(200).json({
      message: "Spreadsheet import completed.",
      results,
    });
  } catch (error) {
    console.error("Import leads error:", error);

    return res.status(500).json({
      message: "Unable to process the spreadsheet.",
    });
  }
};

export const convertLeadToStudent = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid lead ID." });
    }

    let result = null;

    await session.withTransaction(async () => {
      const lead = await Lead.findById(req.params.id).session(session);

      if (!lead) {
        const error = new Error("Lead not found.");
        error.statusCode = 404;
        throw error;
      }

      // Counselors may convert only their own assigned leads.
      if (
        !isAdmin(req) &&
        String(lead.assignedCounselor) !== String(req.user._id)
      ) {
        const error = new Error(
          "You cannot convert a lead assigned to another counselor.",
        );
        error.statusCode = 403;
        throw error;
      }

      if (lead.status !== "interested") {
        const error = new Error(
          lead.status === "converted"
            ? "This lead has already been converted."
            : `Only leads with interested status can be converted. Current status: ${lead.status}.`,
        );

        error.statusCode = 409;
        throw error;
      }

      const email = normalizeEmail(lead.email);

      if (!email || !validateEmail(email)) {
        const error = new Error(
          "A valid email address is required before converting this lead. Please update the lead first.",
        );
        error.statusCode = 400;
        throw error;
      }

      if (!lead.interestedCourse) {
        const error = new Error(
          "Please assign an interested course before converting this lead.",
        );
        error.statusCode = 400;
        throw error;
      }

      const course = await Course.findById(lead.interestedCourse)
        .select("_id")
        .session(session);

      if (!course) {
        const error = new Error("The selected course no longer exists.");
        error.statusCode = 400;
        throw error;
      }

      // Reuse an existing account only if it is a student.
      let student = await User.findOne({ email }).session(session);
      let accountCreated = false;

      if (student && student.role !== "student") {
        const error = new Error(
          "This email belongs to a non-student account. Please resolve the account conflict before converting this lead.",
        );
        error.statusCode = 409;
        throw error;
      }

      if (!student) {
        // Generate an unpredictable initial password.
        // Never return it to the counselor or expose it in the response.
        const temporaryPassword = crypto.randomBytes(32).toString("hex");
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        const [createdStudent] = await User.create(
          [
            {
              name: lead.name,
              email,
              phone: lead.phone,
              password: hashedPassword,
              role: "student",
            },
          ],
          { session },
        );

        student = createdStudent;
        accountCreated = true;
      }

      let enrollment = await Enrollment.findOne({
        studentId: student._id,
        courseId: course._id,
      }).session(session);

      if (enrollment && ["rejected", "revoked"].includes(enrollment.status)) {
        const error = new Error(
          `This student already has a ${enrollment.status} enrollment for the selected course. Review the existing enrollment before proceeding.`,
        );
        error.statusCode = 409;
        throw error;
      }

      if (!enrollment) {
        const [createdEnrollment] = await Enrollment.create(
          [
            {
              studentId: student._id,
              courseId: course._id,
              status: "pending",
            },
          ],
          { session },
        );

        enrollment = createdEnrollment;
      }

      const previousStatus = lead.status;
      lead.status = "converted";
      await lead.save({ session });

      await logLeadActivity({
        leadId: lead._id,
        userId: req.user._id,
        action: "lead_converted",
        description: `Lead "${lead.name}" was converted to a student. Course enrollment status: ${enrollment.status}.`,
        changes: [
          {
            field: "status",
            oldValue: previousStatus,
            newValue: "converted",
            oldLabel: previousStatus,
            newLabel: "converted",
          },
        ],
        session,
      });

      result = {
        studentId: String(student._id),
        studentName: student.name,
        studentEmail: student.email,
        courseId: String(course._id),
        enrollmentStatus: enrollment.status,
        accountCreated,
      };
    });

    return res.status(200).json({
      message: result.accountCreated
        ? "Lead converted. Student account created and enrollment submitted for approval."
        : "Lead converted. Existing student account linked and enrollment checked.",
      conversion: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A duplicate account or enrollment was detected. Refresh the lead and check the existing student and enrollment before retrying.",
      });
    }

    console.error("Convert lead error:", error);

    return res.status(500).json({
      message:
        "Unable to convert this lead. No partial conversion should be committed.",
    });
  } finally {
    await session.endSession();
  }
};


export const getCounselorWorkload = async (req, res) => {
  try {
    // Only admins may view counselor workload.
    if (!isAdmin(req)) {
      return res.status(403).json({
        message: "Only admins can view counselor workload.",
      });
    }

    const now = new Date();

    const [counselors, workload, unassignedLeads] =
      await Promise.all([
        User.find({ role: "admission_counselor" })
          .select("_id name email")
          .sort({ name: 1 })
          .lean(),

        Lead.aggregate([
          {
            $match: {
              assignedCounselor: { $ne: null },
            },
          },
          {
            $group: {
              _id: "$assignedCounselor",

              total: { $sum: 1 },

              new: {
                $sum: {
                  $cond: [{ $eq: ["$status", "new"] }, 1, 0],
                },
              },

              contacted: {
                $sum: {
                  $cond: [{ $eq: ["$status", "contacted"] }, 1, 0],
                },
              },

              interested: {
                $sum: {
                  $cond: [{ $eq: ["$status", "interested"] }, 1, 0],
                },
              },

              followUp: {
                $sum: {
                  $cond: [{ $eq: ["$status", "follow-up"] }, 1, 0],
                },
              },

              converted: {
                $sum: {
                  $cond: [{ $eq: ["$status", "converted"] }, 1, 0],
                },
              },

              lost: {
                $sum: {
                  $cond: [{ $eq: ["$status", "lost"] }, 1, 0],
                },
              },

              overdueFollowUps: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        {
                          $in: [
                            "$status",
                            ["new", "contacted", "interested", "follow-up"],
                          ],
                        },
                        { $ne: ["$followUpDate", null] },
                        { $lt: ["$followUpDate", now] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              upcomingFollowUps: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        {
                          $in: [
                            "$status",
                            ["new", "contacted", "interested", "follow-up"],
                          ],
                        },
                        { $ne: ["$followUpDate", null] },
                        { $gte: ["$followUpDate", now] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]),

        Lead.countDocuments({ assignedCounselor: null }),
      ]);

    const workloadByCounselor = new Map(
      workload.map((item) => [String(item._id), item]),
    );

    const counselorStats = counselors.map((counselor) => {
      const stats = workloadByCounselor.get(
        String(counselor._id),
      );

      const total = stats?.total || 0;
      const converted = stats?.converted || 0;

      return {
        counselorId: String(counselor._id),
        name: counselor.name,
        email: counselor.email,
        total,
        statuses: {
          new: stats?.new || 0,
          contacted: stats?.contacted || 0,
          interested: stats?.interested || 0,
          followUp: stats?.followUp || 0,
          converted,
          lost: stats?.lost || 0,
        },
        overdueFollowUps: stats?.overdueFollowUps || 0,
        upcomingFollowUps: stats?.upcomingFollowUps || 0,
        conversionRate:
          total > 0
            ? Math.round((converted / total) * 10000) / 100
            : 0,
      };
    });

    const totalAssignedLeads = workload.reduce(
      (sum, item) => sum + item.total,
      0,
    );

    return res.status(200).json({
      summary: {
        totalCounselors: counselors.length,
        totalAssignedLeads,
        unassignedLeads,
        totalOverdueFollowUps: counselorStats.reduce(
          (sum, item) => sum + item.overdueFollowUps,
          0,
        ),
        totalUpcomingFollowUps: counselorStats.reduce(
          (sum, item) => sum + item.upcomingFollowUps,
          0,
        ),
      },
      counselors: counselorStats,
    });
  } catch (error) {
    console.error("Get counselor workload error:", error);

    return res.status(500).json({
      message: "Unable to retrieve counselor workload.",
    });
  }
};
