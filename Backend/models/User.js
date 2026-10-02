import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "admin", "mentor"],
      default: "student",
    },

    // ================================
    // PASSWORD RESET OTP
    // ================================

    resetPasswordOtp: {
      type: String,
    },

    resetPasswordOtpExpire: {
      type: Date,
    },

    resetPasswordOtpAttempts: {
      type: Number,
      default: 0,
    },

    // ================================
    // PASSWORD RESET TOKEN
    // ================================

    resetPasswordToken: {
      type: String,
    },

    resetPasswordTokenExpire: {
      type: Date,
    },

    // ================================
    // PROFILE
    // ================================

    avatar: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: 250,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },

    dob: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;