import bcrypt from "bcryptjs";
import User from "../../models/User.js";

// Get logged-in user's profile
export const getProfile = async (userId) => {
  return await User.findById(userId).select("-password");
};

// Update profile
export const updateProfile = async (userId, data) => {
  const { name, phone, bio, gender, dob } = data;

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.name = name ?? user.name;
  user.phone = phone ?? user.phone;
  user.bio = bio ?? user.bio;
  user.gender = gender ?? user.gender;
  user.dob = dob ?? user.dob;

  await user.save();

  return await User.findById(userId).select("-password");
};

// Change password
export const changePassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(
    currentPassword,
    user.password
  );
  const isSamePassword = await bcrypt.compare(
  newPassword,
  user.password
);

if (isSamePassword) {
  throw new Error(
    "New password cannot be the same as the current password"
  );
}
  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }
  
  user.password = await bcrypt.hash(newPassword, 10);

  await user.save();

  return true;
};