import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import FollowUp from "../models/FollowUp.js";
import LeadActivity from "../models/LeadActivity.js";
import ExcelJS from "exceljs";
import { Readable } from "node:stream";

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

const isAdmin = (req) => req.user.role === "admin";

const isValidId = (id) =>
  typeof id === "string" || id instanceof mongoose.Types.ObjectId
    ? mongoose.Types.ObjectId.isValid(id)
    : false;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ============================================================
// AUDIT LABEL HELPERS
// ============================================================

const getCourseLabel = async (courseId, session = null) => {
  if (!courseId || !isValidId(courseId)) {
    return null;
  }

  let query = Course.findById(courseId).select("title name");

  if (session) query = query.session(session);

  const course = await query;

  return course ? course.title || course.name || "Unnamed course" : null;
};

const getCounselorLabel = async (counselorId, session = null) => {
  if (!counselorId || !isValidId(counselorId)) {
    return null;
  }

  let query = User.findById(counselorId).select("name email");

  if (session) query = query.session(session);

  const counselor = await query;

  return counselor
    ? counselor.name || counselor.email || "Unnamed counselor"
    : null;
};

const getFieldLabel = async (field, value, session = null) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (field === "interestedCourse") {
    return getCourseLabel(value, session);
  }

  if (field === "assignedCounselor") {
    return getCounselorLabel(value, session);
  }

  if (field === "followUpDate") {
    return new Date(value).toLocaleString();
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

  if (!isValidId(courseId)) {
    return { valid: false };
  }

  const course = await Course.findById(courseId).select("_id");

  return course ? { valid: true, value: course._id } : { valid: false };
};

const validateCounselor = async (counselorId) => {
  if (counselorId === undefined || counselorId === null || counselorId === "") {
    return { valid: true, value: null };
  }

  if (!isValidId(counselorId)) {
    return { valid: false };
  }

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

    if (
      typeof phone !== "string" ||
      !phone.trim() ||
      phone.trim().length > 20
    ) {
      return res.status(400).json({
        message: "A valid phone number is required.",
      });
    }

    if (email !== undefined && email !== null && typeof email !== "string") {
      return res.status(400).json({ message: "Invalid email address." });
    }

    const normalizedEmail = (email || "").trim().toLowerCase();

    if (
      normalizedEmail.length > 254 ||
      (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))
    ) {
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

    if (followUpDate && Number.isNaN(Date.parse(followUpDate))) {
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
      followUpDate: followUpDate || null,
      notes: notes?.trim() || "",
      createdBy: req.user._id,
    });

    const initialChanges = [];

    initialChanges.push(await createAuditChange("status", null, lead.status));

    initialChanges.push(
      await createAuditChange(
        "interestedCourse",
        null,
        lead.interestedCourse ? String(lead.interestedCourse) : null,
      ),
    );

    initialChanges.push(
      await createAuditChange(
        "assignedCounselor",
        null,
        lead.assignedCounselor ? String(lead.assignedCounselor) : null,
      ),
    );

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

    return res.status(500).json({
      message: "Unable to create lead.",
    });
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
          return res.status(400).json({
            message: "Invalid counselor ID.",
          });
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

    return res.status(500).json({
      message: "Unable to retrieve leads.",
    });
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

    return res.status(500).json({
      message: "Unable to retrieve lead.",
    });
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
      return res.status(403).json({
        message: "You cannot update this lead.",
      });
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

      const normalizedEmail = email.trim().toLowerCase();

      if (
        normalizedEmail.length > 254 ||
        (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))
      ) {
        return res.status(400).json({ message: "Invalid email address." });
      }

      lead.email = normalizedEmail;
    }

    if (phone !== undefined) {
      if (
        typeof phone !== "string" ||
        !phone.trim() ||
        phone.trim().length > 20
      ) {
        return res.status(400).json({ message: "Invalid phone number." });
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
      if (
        followUpDate !== null &&
        followUpDate !== "" &&
        Number.isNaN(Date.parse(followUpDate))
      ) {
        return res.status(400).json({ message: "Invalid follow-up date." });
      }

      lead.followUpDate = followUpDate || null;
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

      const oldValue = previousValues[field];

      if (oldValue === newValue) continue;

      changes.push(
        await createAuditChange(field, oldValue ?? null, newValue ?? null),
      );
    }

    if (changes.length > 0) {
      const statusChanged = changes.some((change) => change.field === "status");

      const counselorChanged = changes.some(
        (change) => change.field === "assignedCounselor",
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
              .map((change) => change.field)
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

    return res.status(500).json({
      message: "Unable to update lead.",
    });
  }
};

// ============================================================
// DELETE LEAD
// ============================================================

export const deleteLead = async (req, res) => {
  try {
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

    return res.status(500).json({
      message: "Unable to delete lead.",
    });
  }
};

// ============================================================
// ACCESS CONTROL HELPER
// ============================================================

const getAccessibleLead = async (leadId, user) => {
  if (!isValidId(leadId)) {
    return { error: "invalid-id" };
  }

  const lead = await Lead.findById(leadId);

  if (!lead) {
    return { error: "not-found" };
  }

  if (
    !isAdmin({ user }) &&
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
        change.field === "interestedCourse" ||
        change.field === "assignedCounselor"
      ) {
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
    const item = activity.toObject();

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
      .lean({ virtuals: false });

    const resolvedActivities = await resolveActivityLabels(
      activities.map((activity) => ({
        ...activity,
        toObject: () => activity,
      })),
    );

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

    if (
      nextFollowUpDate !== undefined &&
      nextFollowUpDate !== null &&
      nextFollowUpDate !== "" &&
      (typeof nextFollowUpDate !== "string" ||
        Number.isNaN(Date.parse(nextFollowUpDate)))
    ) {
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
              nextFollowUpDate: nextFollowUpDate || null,
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

          lead.followUpDate = nextFollowUpDate || null;
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

export const importLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a CSV or Excel file.",
      });
    }

    const fileName = req.file.originalname.toLowerCase();

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

        const parser = Readable.from([csvText]);

        parser.on("error", reject);

        import("csv-parse")
          .then(({ parse }) => {
            parser
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
      rows.forEach((values) => {
        csvWorksheet.addRow(values);
      });
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

    const normalizeHeader = (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
    console.log("IMPORT DEBUG - filename:", req.file.originalname);
    console.log("IMPORT DEBUG - first row:", worksheet.getRow(1).values);
    console.log(
      "IMPORT DEBUG - first cell:",
      worksheet.getRow(1).getCell(1).value,
    );
    const headerRow = worksheet.getRow(1);
const headers = [];

headerRow.eachCell(
  { includeEmpty: true },
  (cell, columnNumber) => {
    headers[columnNumber] = normalizeHeader(
      cell.text || cell.value,
    );
  },
);

console.log("EXCEL DEBUG - filename:", req.file.originalname);
console.log("EXCEL DEBUG - worksheet name:", worksheet.name);
console.log("EXCEL DEBUG - row 1 values:", worksheet.getRow(1).values);
console.log("EXCEL DEBUG - normalized headers:", headers);
    
    const requiredColumns = ["name", "phone"];
    const missingColumns = requiredColumns.filter(
      (column) => !headers.includes(column),
    );

    if (missingColumns.length > 0) {
      return res.status(400).json({
        message: `Missing required columns: ${missingColumns.join(", ")}`,
      });
    }

    const lastRow = worksheet.rowCount - 1;

    if (lastRow > 500) {
      return res.status(400).json({
        message: "You can import a maximum of 500 lead rows at a time.",
      });
    }

    const getValue = (row, columnName) => {
      const normalizedColumn = normalizeHeader(columnName);
      const columnIndex = headers.findIndex(
        (header) => header === normalizedColumn,
      );

      if (columnIndex === -1) return "";

      const cell = row.getCell(columnIndex);
      const value = cell.value;

      if (value === null || value === undefined) return "";

      if (typeof value === "object" && !(value instanceof Date)) {
        if ("text" in value) return String(value.text).trim();
        if ("result" in value) return String(value.result ?? "").trim();
        return "";
      }

      return String(value).trim();
    };

    const normalizePhone = (value) => String(value ?? "").replace(/\D/g, "");

    const normalizeEmail = (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase();

    const validSources = [
      "website",
      "phone",
      "walk-in",
      "referral",
      "meta-ads",
      "other",
    ];

    const validStatuses = [
      "new",
      "contacted",
      "interested",
      "follow-up",
      "converted",
      "lost",
    ];

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

      if (courseName) {
        if (!courseByName.has(courseName)) {
          courseByName.set(courseName, []);
        }

        courseByName.get(courseName).push(course);
      }
    }

    const counselorByName = new Map();

    for (const counselor of counselors) {
      for (const value of [counselor.name, counselor.email]) {
        const key = String(value || "")
          .trim()
          .toLowerCase();

        if (key) {
          if (!counselorByName.has(key)) {
            counselorByName.set(key, []);
          }

          counselorByName.get(key).push(counselor);
        }
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

      if (
        row.values
          .slice(1)
          .every(
            (value) => value === null || value === undefined || value === "",
          )
      ) {
        continue;
      }

      results.totalRows++;

      try {
        console.log("IMPORT DEBUG - headers:", headers);
        console.log("IMPORT DEBUG - row values:", row.values);
        console.log(
          "IMPORT DEBUG - phone header index:",
          headers.indexOf("phone"),
        );
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

        if (!phone || phone.length > 20) {
          throw new Error(
            "Phone is required and must be at most 20 characters.",
          );
        }

        if (!normalizePhone(phone)) {
          throw new Error("Phone must contain at least one digit.");
        }

        if (
          email &&
          (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        ) {
          throw new Error("Please provide a valid email address.");
        }

        if (!validSources.includes(sourceInput)) {
          throw new Error(`Invalid source: ${sourceInput}`);
        }

        if (!validStatuses.includes(statusInput)) {
          throw new Error(`Invalid status: ${statusInput}`);
        }

        const normalizedPhone = normalizePhone(phone);

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
        const followUpInput = getValue(row, "followUpDate");

        if (followUpInput !== "") {
          let parsedDate;

          if (followUpInput instanceof Date) {
            parsedDate = followUpInput;
          } else if (
            typeof followUpInput === "number" &&
            fileName.endsWith(".xlsx")
          ) {
            parsedDate = new Date(
              Date.UTC(1899, 11, 30) + followUpInput * 24 * 60 * 60 * 1000,
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
          description: "Lead imported from spreadsheet",
        });

        existingPhones.add(normalizedPhone);

        if (email) {
          existingEmails.add(email);
        }

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
