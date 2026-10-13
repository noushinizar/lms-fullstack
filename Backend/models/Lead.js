
import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      default: "",
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: 20,
    },

    interestedCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    source: {
      type: String,
      enum: [
        "website",
        "phone",
        "walk-in",
        "referral",
        "meta-ads",
        "other",
      ],
      default: "other",
    },

    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "interested",
        "follow-up",
        "converted",
        "lost",
      ],
      default: "new",
    },

    assignedCounselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

leadSchema.index({ createdAt: -1 });
leadSchema.index({ status: 1 });
leadSchema.index({ assignedCounselor: 1 });

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
