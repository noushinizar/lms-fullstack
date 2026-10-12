import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const createCounselor = async (req, res) => {
  try {
    const { name, email, phone = "", password } = req.body;

    const normalizedName =
      typeof name === "string" ? name.trim() : "";

    const normalizedEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    if (normalizedName.length > 100) {
      return res.status(400).json({
        message: "Name must not exceed 100 characters.",
      });
    }

    const userExists = await User.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const counselor = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      phone: typeof phone === "string" ? phone.trim() : "",
      password: hashedPassword,
      role: "admission_counselor",
    });

    return res.status(201).json({
      message: "Counselor account created successfully.",
      user: {
        _id: counselor._id,
        name: counselor.name,
        email: counselor.email,
        phone: counselor.phone,
        role: counselor.role,
      },
    });
  } catch (error) {
    // Handle duplicate-email conflicts, including concurrent requests.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("CREATE COUNSELOR ERROR:", error);

    return res.status(500).json({
      message: "Unable to create counselor account.",
    });
  }
};

//updateCounselor

export const updateCounselor = async (req, res) => {
  try {
    const { name, email, phone = "" } = req.body;

    const normalizedName =
      typeof name === "string" ? name.trim() : "";

    const normalizedEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    if (!normalizedName || !normalizedEmail) {
      return res.status(400).json({
        message: "Name and email are required.",
      });
    }

    if (normalizedName.length > 100) {
      return res.status(400).json({
        message: "Name must not exceed 100 characters.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    if (typeof phone !== "string") {
      return res.status(400).json({
        message: "Phone must be a string.",
      });
    }

    const counselor = await User.findById(req.params.id);

    if (!counselor) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Only counselor accounts can be edited through this endpoint.
    if (counselor.role !== "admission_counselor") {
      return res.status(400).json({
        message: "This account is not an admission counselor.",
      });
    }

    // Prevent duplicate email addresses.
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: counselor._id },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    counselor.name = normalizedName;
    counselor.email = normalizedEmail;
    counselor.phone = phone.trim();

    await counselor.save();

    return res.status(200).json({
      message: "Counselor updated successfully.",
      user: {
        _id: counselor._id,
        name: counselor.name,
        email: counselor.email,
        phone: counselor.phone,
        role: counselor.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("UPDATE COUNSELOR ERROR:", error);

    return res.status(500).json({
      message: "Unable to update counselor.",
    });
  }
};

//update Role

export const updateUserRole = async (req, res) => {
  try {
    const allowedRoles = ["student", "admin", "mentor", "admission_counselor"];

    if (!allowedRoles.includes(req.body.role)) {
      return res.status(400).json({
        message: "Invalid user role.",
      });
    }
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent changing your own role
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        message: "You cannot change your own role.",
      });
    }

    // Prevent changing the last admin
    if (user.role === "admin" && req.body.role !== "admin") {
      const adminCount = await User.countDocuments({
        role: "admin",
      });

      if (adminCount === 1) {
        return res.status(400).json({
          message: "At least one admin must exist.",
        });
      }
    }

    user.role = req.body.role;

    await user.save();

    res.json({
      message: "Role updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//delete user

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent deleting yourself
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account.",
      });
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({
        role: "admin",
      });

      if (adminCount === 1) {
        return res.status(400).json({
          message: "Cannot delete the last admin.",
        });
      }
    }

    await user.deleteOne();

    res.json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
