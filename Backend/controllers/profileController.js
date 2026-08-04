import * as profileService from "../services/profile/profileService.js";

// Get Profile
export const getProfile = async (req, res) => {
  try {
    const profile = await profileService.getProfile(req.user._id);

    res.json(profile);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const profile = await profileService.updateProfile(
      req.user._id,
      req.body
    );

    res.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    await profileService.changePassword(
      req.user._id,
      currentPassword,
      newPassword
    );

    res.json({
      message: "Password changed successfully",
    });

  } catch (error) {

    res.status(400).json({
      message: error.message,
    });

  }
};