import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import FollowUp from "../models/FollowUp.js";

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

const isAdmin = (req) => req.user.role === "admin";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validateCourse = async (courseId) => {
  // Selecting a course is optional when creating a lead.
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
  // Assigning a counselor is optional when creating a lead.
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

// Create a lead
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
      return res
        .status(400)
        .json({ message: "Notes cannot exceed 5000 characters." });
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
      // Counselors can create leads only for themselves.
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

// Get and filter leads
export const getLeads = async (req, res) => {
  try {
    const { search, status, source, assignedCounselor } = req.query;

    const filter = {};

    // Counselors can only view their own assigned leads.
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

// Get one lead
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

// Update a lead
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

    // Only admins can assign or reassign leads.
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

// Delete a lead (admin only; enforced in routes too)
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


const followUpTypes = [
  "call",
  "whatsapp",
  "meeting",
  "email",
  "other",
];

const followUpOutcomes = [
  "interested",
  "no-answer",
  "callback-requested",
  "not-interested",
  "enrolled",
  "other",
];

// Check whether the current user can access this lead.
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

// Get a lead's follow-up history.
export const getFollowUps = async (req, res) => {
  try {
    const result = await getAccessibleLead(
      req.params.leadId,
      req.user
    );

    if (result.error === "invalid-id") {
      return res.status(400).json({
        message: "Invalid lead ID.",
      });
    }

    if (result.error === "not-found") {
      return res.status(404).json({
        message: "Lead not found.",
      });
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

// Record a new follow-up activity.

export const createFollowUp = async (req, res) => {
  try {
    const result = await getAccessibleLead(
      req.params.leadId,
      req.user
    );

    if (result.error === "invalid-id") {
      return res.status(400).json({
        message: "Invalid lead ID.",
      });
    }

    if (result.error === "not-found") {
      return res.status(404).json({
        message: "Lead not found.",
      });
    }

    if (result.error === "forbidden") {
      return res.status(403).json({
        message: "You cannot add follow-ups to this lead.",
      });
    }

    const {
      type,
      outcome,
      notes,
      nextFollowUpDate,
    } = req.body;

    if (!followUpTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid follow-up type.",
      });
    }

    if (
      outcome !== undefined &&
      !followUpOutcomes.includes(outcome)
    ) {
      return res.status(400).json({
        message: "Invalid follow-up outcome.",
      });
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
      (
        typeof nextFollowUpDate !== "string" ||
        Number.isNaN(Date.parse(nextFollowUpDate))
      )
    ) {
      return res.status(400).json({
        message: "Invalid next follow-up date.",
      });
    }

    // Save the follow-up and lead date as one transaction.
    const session = await mongoose.startSession();
    let followUpId;

    try {
      await session.withTransaction(async () => {
        // Fetch the latest lead inside the transaction.
        const lead = await Lead.findById(
          result.lead._id
        ).session(session);

        if (!lead) {
          const error = new Error("Lead not found.");
          error.statusCode = 404;
          throw error;
        }

        // Recheck counselor access before saving.
        if (
          !isAdmin(req) &&
          String(lead.assignedCounselor) !==
            String(req.user._id)
        ) {
          const error = new Error(
            "You cannot add follow-ups to this lead."
          );
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
              nextFollowUpDate:
                nextFollowUpDate || null,
              createdBy: req.user._id,
            },
          ],
          { session }
        );

        followUpId = followUp._id;

        // Synchronize the lead's scheduled follow-up date.
        if (nextFollowUpDate !== undefined) {
          lead.followUpDate = nextFollowUpDate || null;
          await lead.save({ session });
        }
      });
    } finally {
      await session.endSession();
    }

    // Return the saved record after the transaction commits.
    const followUp = await FollowUp.findById(followUpId)
      .populate("createdBy", "name email");

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

