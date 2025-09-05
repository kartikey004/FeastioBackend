import User from "../models/userModel.js";

// @route   PUT /api/users/profile
// @desc    Update user profile (dietaryRestrictions, allergies, healthGoals, cuisinePreferences)
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // from protect middleware
    const { dietaryRestrictions, allergies, healthGoals, cuisinePreferences } =
      req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only update profile fields provided in request
    user.profile.dietaryRestrictions =
      dietaryRestrictions ?? user.profile.dietaryRestrictions;
    user.profile.allergies = allergies ?? user.profile.allergies;
    user.profile.healthGoals = healthGoals ?? user.profile.healthGoals;
    user.profile.cuisinePreferences =
      cuisinePreferences ?? user.profile.cuisinePreferences;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      profile: user.profile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id; // from auth middleware
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId).select(
      "email username phoneNumber profile profilePicture"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // If no profile picture, fallback to first letter of username
    const profilePicture =
      user.profilePicture ||
      (user.username ? user.username.charAt(0).toUpperCase() : null);

    res.json({
      success: true,
      data: {
        email: user.email,
        username: user.username,
        phoneNumber: user.phoneNumber,
        profile: user.profile,
        profilePicture,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
