import User from "../models/userModel.js";

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      dietaryRestrictions,
      allergies,
      healthGoals,
      cuisinePreferences,
      gender,
      age,
      height,
      weight,
      activityLevel,
      healthConditions,
      menstrualHealth,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profile.dietaryRestrictions =
      dietaryRestrictions ?? user.profile.dietaryRestrictions;
    user.profile.allergies = allergies ?? user.profile.allergies;
    user.profile.healthGoals = healthGoals ?? user.profile.healthGoals;
    user.profile.cuisinePreferences =
      cuisinePreferences ?? user.profile.cuisinePreferences;

    user.profile.gender = gender ?? user.profile.gender;
    user.profile.age = age ?? user.profile.age;
    user.profile.height = height ?? user.profile.height;
    user.profile.weight = weight ?? user.profile.weight;
    user.profile.activityLevel = activityLevel ?? user.profile.activityLevel;
    user.profile.healthConditions =
      healthConditions ?? user.profile.healthConditions;
    user.profile.menstrualHealth =
      menstrualHealth ?? user.profile.menstrualHealth;

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
    const userId = req.user?._id;
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
