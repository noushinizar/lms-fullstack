
import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["call", "whatsapp", "meeting", "email", "other"],
      required: true,
    },

    outcome: {
      type: String,
      enum: [
        "interested",
        "no-answer",
        "callback-requested",
        "not-interested",
        "enrolled",
        "other",
      ],
      default: "other",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    nextFollowUpDate: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

followUpSchema.index({ lead: 1, createdAt: -1 });

const FollowUp = mongoose.model("FollowUp", followUpSchema);

export default FollowUp;
