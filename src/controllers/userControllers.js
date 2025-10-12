import User from "../models/userModel.js";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

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

    // Update MongoDB
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

    // 🔹 Update Redis for AI chat
    const redisProfileKey = `userProfile:${userId}`;
    const userProfileContext = `
User Profile (for context only, do not display to user):
- Username: ${user.username}
- Dietary Restrictions: ${user.profile.dietaryRestrictions.join(", ")}
- Allergies: ${user.profile.allergies.join(", ")}
- Health Goals: ${user.profile.healthGoals.join(", ")}
- Cuisine Preferences: ${user.profile.cuisinePreferences.join(", ")}
- Age: ${user.profile.age || "N/A"}
- Gender: ${user.profile.gender || "N/A"}
- Height: ${user.profile.height || "N/A"} cm
- Weight: ${user.profile.weight || "N/A"} kg
- Activity Level: ${user.profile.activityLevel || "N/A"}
- Health Conditions: ${user.profile.healthConditions.join(", ")}
- Menstrual Health: ${user.profile.menstrualHealth || "N/A"}
`;
    await redis.set(
      redisProfileKey,
      userProfileContext,
      "EX",
      60 * 60 * 24 * 14
    );
    console.log("[updateProfile] Redis profile updated for user:", userId);

    res.status(200).json({
      message: "Profile updated successfully",
      profile: user.profile,
    });
  } catch (error) {
    console.error("[updateProfile] Error updating profile:", error);
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
