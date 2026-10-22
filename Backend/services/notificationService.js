
import Lead from "../models/Lead.js";
import Notification from "../models/Notification.js";

const ACTIVE_LEAD_STATUSES = [
  "new",
  "contacted",
  "interested",
  "follow-up",
];

const UPCOMING_WINDOW_HOURS = 24;

export const generateFollowUpReminders = async () => {
  const now = new Date();

  const upcomingLimit = new Date(
    now.getTime() + UPCOMING_WINDOW_HOURS * 60 * 60 * 1000,
  );

  // Find active leads with a follow-up date that has arrived
  // or is approaching within the next 24 hours.
  const leads = await Lead.find({
    status: { $in: ACTIVE_LEAD_STATUSES },
    assignedCounselor: { $ne: null },
    followUpDate: {
      $ne: null,
      $lte: upcomingLimit,
    },
  })
    .select("_id name assignedCounselor followUpDate status")
    .lean();

  let remindersCreated = 0;
  let remindersReassigned = 0;

  for (const lead of leads) {
    if (!lead.followUpDate || !lead.assignedCounselor) {
      continue;
    }

    const dueDate = new Date(lead.followUpDate);
    const isOverdue = dueDate < now;

    const type = isOverdue
      ? "follow_up_overdue"
      : "follow_up_due";

    // Identify a reminder by its lead, type, and scheduled date.
    const deduplicationKey = [
      type,
      lead._id.toString(),
      dueDate.toISOString(),
    ].join(":");

    const title = isOverdue
      ? "Follow-up overdue"
      : "Follow-up coming up";

    const message = isOverdue
      ? `Follow-up with ${lead.name} is overdue. Please take action.`
      : `Your follow-up with ${lead.name} is due within the next 24 hours.`;

    // Check whether this reminder already exists.
    const existingNotification = await Notification.findOne({
      deduplicationKey,
    })
      .select("_id recipient")
      .lean();

    if (existingNotification) {
      // Transfer an existing reminder if the lead was reassigned.
      if (
        existingNotification.recipient.toString() !==
        lead.assignedCounselor.toString()
      ) {
        const result = await Notification.updateOne(
          {
            _id: existingNotification._id,
            recipient: existingNotification.recipient,
          },
          {
            $set: {
              recipient: lead.assignedCounselor,
              lead: lead._id,
              type,
              title,
              message,
              isRead: false,
              readAt: null,
            },
          },
        );

        if (result.modifiedCount > 0) {
          remindersReassigned += 1;
        }
      }

      // Do not create another copy of an existing reminder.
      continue;
    }

    // Create a new reminder only if one does not already exist.
    try {
      const result = await Notification.updateOne(
        { deduplicationKey },
        {
          $setOnInsert: {
            recipient: lead.assignedCounselor,
            lead: lead._id,
            type,
            title,
            message,
            isRead: false,
            readAt: null,
            deduplicationKey,
          },
        },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        remindersCreated += 1;
      }
    } catch (error) {
      // A concurrent scheduler run may have created the reminder.
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  return {
    leadsChecked: leads.length,
    remindersCreated,
    remindersReassigned,
    checkedAt: now,
  };
};
