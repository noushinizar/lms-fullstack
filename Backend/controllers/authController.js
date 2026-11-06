import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import generateToken from "../services/auth/generateToken.js";
import sendEmail from "../config/mail.js";

// ======================================================
// REGISTER USER
// ======================================================

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    const userExists = await User.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      role: "student",
    });

    return res.status(201).json({
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
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

// ======================================================
// LOGIN USER
// ======================================================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Prevent newly created students from logging in before activation
    if (user.accountActivationToken) {
      return res.status(403).json({
        message:
          "Please activate your account using the link sent to your email.",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
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
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};

// ======================================================
// FORGOT PASSWORD - SEND OTP THROUGH BREVO
// ======================================================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const genericMessage =
      "If an account exists with this email, a verification code has been sent.";

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Do not reveal whether an account exists
    if (!user) {
      return res.status(200).json({
        message: genericMessage,
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP before storing
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Save OTP
    user.resetPasswordOtp = hashedOtp;

    user.resetPasswordOtpExpire = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordOtpAttempts = 0;

    // Clear previous reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;

    await user.save();

    // Escape user name for HTML
    const safeName = String(user.name || "User").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );

    // Send OTP through Brevo
    try {
      const result = await sendEmail({
        to: user.email,

        subject: "Password Reset Verification Code",

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 20px auto;
            background: #f8fafc;
            border-radius: 10px;
            overflow: hidden;
          ">
            <div style="
              background: #ffffff;
              padding: 30px;
            ">
              <h2 style="color: #202A3A;">
                Password Reset
              </h2>

              <p>Hello ${safeName},</p>

              <p>
                We received a request to reset your
                password. Please use the
                verification code below.
              </p>

              <div style="
                text-align: center;
                margin: 30px 0;
              ">
                <span style="
                  display: inline-block;
                  background: #f59e0b;
                  color: #ffffff;
                  font-size: 32px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  padding: 15px 25px;
                  border-radius: 8px;
                ">
                  ${otp}
                </span>
              </div>

              <p>
                This verification code will expire in
                <strong>10 minutes</strong>.
              </p>

              <p>
                If you did not request a password reset,
                you can safely ignore this email.
              </p>

              <hr style="
                border: none;
                border-top: 1px solid #e5e7eb;
                margin: 25px 0;
              " />

              <p style="
                color: #6b7280;
                font-size: 13px;
                text-align: center;
              ">
                © ${new Date().getFullYear()} Astrobyte
              </p>
            </div>
          </div>
        `,
      });

      console.log(
        "FORGOT PASSWORD: Brevo accepted email request",
        result?.messageId || "",
      );
    } catch (emailError) {
      console.error("BREVO EMAIL ERROR:", emailError);

      // Clear OTP if email sending fails
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpire = undefined;
      user.resetPasswordOtpAttempts = 0;

      await user.save();

      return res.status(500).json({
        message: "Unable to send verification code",
      });
    }

    return res.status(200).json({
      message: genericMessage,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Unable to send verification code",
    });
  }
};

// ======================================================
// VERIFY RESET OTP
// ======================================================

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (
      !email ||
      typeof email !== "string" ||
      !otp ||
      !/^\d{6}$/.test(String(otp))
    ) {
      return res.status(400).json({
        message: "Valid email and 6-digit verification code are required",
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

    // Check OTP existence
    if (!user.resetPasswordOtp) {
      return res.status(400).json({
        message: "No active verification code. Please request a new one.",
      });
    }

    // Check expiration
    if (
      !user.resetPasswordOtpExpire ||
      user.resetPasswordOtpExpire.getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: "Verification code has expired",
      });
    }

    // Check maximum attempts
    if (user.resetPasswordOtpAttempts >= 5) {
      return res.status(429).json({
        message:
          "Too many incorrect attempts. Please request a new verification code.",
      });
    }

    // Hash entered OTP
    const hashedOtp = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

    const storedOtp = user.resetPasswordOtp;

    // Timing-safe comparison
    const otpMatches =
      /^[a-f0-9]{64}$/i.test(storedOtp) &&
      crypto.timingSafeEqual(
        Buffer.from(hashedOtp, "hex"),
        Buffer.from(storedOtp, "hex"),
      );

    if (!otpMatches) {
      user.resetPasswordOtpAttempts += 1;

      await user.save();

      return res.status(400).json({
        message: "Invalid verification code",
      });
    }

    // Generate temporary reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedResetToken;

    user.resetPasswordTokenExpire = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate OTP after successful verification
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    user.resetPasswordOtpAttempts = 0;

    await user.save();

    console.log("VERIFY OTP: OTP verified successfully");

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

    if (
      !resetToken ||
      typeof resetToken !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    // Password validation
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

    // Clear all reset data
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    user.resetPasswordOtpAttempts = 0;

    await user.save();

    console.log(
      "RESET PASSWORD: Password updated successfully for:",
      user.email,
    );

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
// ACTIVATE STUDENT ACCOUNT
// ======================================================

export const activateAccount = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (
      !token ||
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token) ||
      !password ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "A valid activation token and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    // Hash the activation token before searching MongoDB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find a student account with a valid activation token
    const user = await User.findOne({
      accountActivationToken: hashedToken,
      accountActivationTokenExpire: {
        $gt: new Date(),
      },
      role: "student",
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired activation link. Please request a new one.",
      });
    }

    // Hash the password selected by the student
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Invalidate the activation link after successful use
    user.accountActivationToken = undefined;
    user.accountActivationTokenExpire = undefined;

    await user.save();

    return res.status(200).json({
      message: "Account activated successfully. You can now log in.",
    });
  } catch (error) {
    console.error("ACTIVATE ACCOUNT ERROR:", error);

    return res.status(500).json({
      message: "Unable to activate account. Please try again.",
    });
  }
};

// ======================================================
// GET PROFILE
// ======================================================

export const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Profile fetched successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      message: "Unable to fetch profile",
    });
  }
};

// ======================================================
// GET MENTORS
// ======================================================

export const getMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }, "name email");

    return res.status(200).json(mentors);
  } catch (error) {
    console.error("GET MENTORS ERROR:", error);

    return res.status(500).json({
      message: "Unable to fetch mentors",
    });
  }
};
