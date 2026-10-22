
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "follow_up_due",
        "follow_up_overdue",
        "lead_assigned",
        "lead_reassigned",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    // Prevent duplicate reminders for the same lead and scheduled date.
    deduplicationKey: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Efficient notification retrieval for each user.
notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

// Prevent duplicate automatically generated reminders.
notificationSchema.index(
  { deduplicationKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      deduplicationKey: { $type: "string" },
    },
  },
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema,
);

export default Notification;
