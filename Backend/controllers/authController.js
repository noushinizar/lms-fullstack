import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import generateToken from "../services/auth/generateToken.js";
import transporter from "../config/mail.js";

// ======================================================
// REGISTER USER
// ======================================================

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "student",
    });

    res.status(201).json({
      message: "Registration successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// LOGIN USER
// ======================================================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// FORGOT PASSWORD - SEND OTP
// ======================================================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Do not reveal whether the email exists.
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, a verification code has been sent.",
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP before saving
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // OTP expires after 10 minutes
    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpire = new Date(
      Date.now() + 10 * 60 * 1000,
    );

    // Reset attempts
    user.resetPasswordOtpAttempts = 0;

    // Remove any old reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;

    await user.save();

    // Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,

      subject: "SkillUp Password Reset Verification Code",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            background: #f8fafc;
          "
        >

          <div
            style="
              background: #202A3A;
              padding: 25px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            "
          >
            <h1 style="color: #ffffff; margin: 0;">
              SkillUp
            </h1>

            <p style="color: #f59e0b; margin-top: 8px;">
              Learning Made Simple
            </p>
          </div>

          <div
            style="
              background: #ffffff;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            "
          >

            <h2 style="color: #202A3A;">
              Password Reset
            </h2>

            <p>
              Hello ${user.name},
            </p>

            <p>
              We received a request to reset your SkillUp password.
              Use the verification code below:
            </p>

            <div
              style="
                text-align: center;
                margin: 30px 0;
              "
            >
              <span
                style="
                  display: inline-block;
                  background: #f59e0b;
                  color: #ffffff;
                  font-size: 32px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  padding: 15px 25px;
                  border-radius: 8px;
                "
              >
                ${otp}
              </span>
            </div>

            <p>
              This verification code will expire in
              <strong>10 minutes</strong>.
            </p>

            <p>
              If you did not request a password reset, you can safely
              ignore this email.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb;" />

            <p
              style="
                color: #6b7280;
                font-size: 13px;
                text-align: center;
              "
            >
              © ${new Date().getFullYear()} SkillUp
            </p>

          </div>
        </div>
      `,
    });

    return res.status(200).json({
      message:
        "If an account exists with this email, a verification code has been sent.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Unable to process password reset request",
    });
  }
};

// ======================================================
// VERIFY RESET OTP
// ======================================================

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and verification code are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid verification code",
      });
    }

    // Check OTP expiration
    if (
      !user.resetPasswordOtpExpire ||
      user.resetPasswordOtpExpire.getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: "Verification code has expired",
      });
    }

    // Maximum OTP attempts
    if (user.resetPasswordOtpAttempts >= 5) {
      return res.status(429).json({
        message:
          "Too many incorrect attempts. Please request a new verification code.",
      });
    }

    // Hash entered OTP
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    // Compare OTP
    if (hashedOtp !== user.resetPasswordOtp) {
      user.resetPasswordOtpAttempts += 1;

      await user.save();

      return res.status(400).json({
        message: "Invalid verification code",
      });
    }

    // OTP is correct
    // Generate temporary reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Reset token valid for 10 minutes
    user.resetPasswordToken = hashedResetToken;

    user.resetPasswordTokenExpire = new Date(
      Date.now() + 10 * 60 * 1000,
    );

    // OTP should no longer be usable
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    user.resetPasswordOtpAttempts = 0;

    await user.save();

    return res.status(200).json({
      message: "Verification successful",

      resetToken,
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return res.status(500).json({
      message: "Unable to verify verification code",
    });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    // Basic password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash reset token
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,

      resetPasswordTokenExpire: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset session",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;

    // Clear password reset data
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;

    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    user.resetPasswordOtpAttempts = 0;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Unable to reset password",
    });
  }
};

// ======================================================
// GET PROFILE
// ======================================================

export const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      message: "Profile fetched successfully",

      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// GET MENTORS
// ======================================================

export const getMentors = async (req, res) => {
  try {
    const mentors = await User.find(
      { role: "mentor" },
      "name email",
    );

    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};