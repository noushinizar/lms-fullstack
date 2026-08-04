import User from "../models/User.js";

// Get all users
export const getUsers = async (req, res) => {
  try {

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

//update Role

export const updateUserRole = async (req, res) => {

  try {

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
    if (
      user.role === "admin" &&
      req.body.role !== "admin"
    ) {

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
      user,
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