
import mongoose from "mongoose";

const leadActivitySchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "lead_created",
        "lead_updated",
        "status_changed",
        "counselor_reassigned",
        "follow_up_added",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    changes: [
      {
        field: {
          type: String,
          required: true,
          trim: true,
        },

        // Original value, usually an ID for referenced records.
        // Keep this for traceability and backward compatibility.
        oldValue: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },

        // New original value, usually an ID for referenced records.
        newValue: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },

        // Human-readable snapshot of the previous value.
        oldLabel: {
          type: String,
          default: null,
          trim: true,
        },

        // Human-readable snapshot of the new value.
        newLabel: {
          type: String,
          default: null,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Efficiently retrieve a lead's activities in chronological order.
leadActivitySchema.index({ lead: 1, createdAt: -1 });

const LeadActivity = mongoose.model(
  "LeadActivity",
  leadActivitySchema
);

export default LeadActivity;
