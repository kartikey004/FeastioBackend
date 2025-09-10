import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import {
  sendOTPEmail,
  sendPasswordResetOTP,
} from "../services/emailServices.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateJWT.js";

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token required" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, phoneNumber } = req.body;

    console.log("Incoming registration request:", {
      username,
      email,
      phoneNumber,
    });

    // Basic validation
    if (!username || !email || !password || !phoneNumber) {
      console.warn("Validation failed: missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn("Registration attempt with existing email:", email);
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Debug env variables
    console.log("SMTP Config:");
    console.log(" - EMAIL_USER:", process.env.EMAIL_USER);
    console.log(" - EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

    // Try sending OTP email first
    try {
      await sendOTPEmail(email, otp);
      console.log("OTP email sent successfully to:", email);
    } catch (err) {
      console.error("❌ Failed to send OTP email:", err.message);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    // Create new user (only after email is sent)
    const user = await User.create({
      authProvider: "local",
      providerId: email,
      email,
      username,
      phoneNumber,
      profilePicture: null,
      password,
      otp,
      otpExpiry,
      isVerified: false,
    });

    console.log("✅ User created in DB:", user._id);

    // Respond without tokens (user must verify first)
    res.status(201).json({
      message:
        "User registered successfully. Please verify your email with the OTP sent.",
      userId: user._id, // needed for OTP verification
    });
  } catch (error) {
    console.error("Register user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({
        message:
          "We could not find a user with this email. Please sign up first.",
      });

    if (user.isVerified)
      return res.status(400).json({
        message: "Your account is already verified. You can log in directly.",
      });

    if (user.otp !== otp.toString())
      return res.status(400).json({
        message: "The OTP you entered is incorrect. Please try again.",
      });

    if (user.otpExpiry < new Date())
      return res
        .status(400)
        .json({ message: "Your OTP has expired. Please request a new one." });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    // Generate tokens after verification
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;

    await user.save();

    res.status(200).json({
      message: "Email verified and logged in successfully",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Please provide your email address to continue." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "No account found with this email. Please sign up first.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Your email is already verified. You can log in directly.",
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "A new OTP has been sent to your email",
      userId: user._id,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.user?._id; // from auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Find user and clear refresh token
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Clear the refresh token from database
    user.refreshToken = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Incoming login request:", { email, password });
    // Validate inputs
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const emailNorm = email.toLowerCase().trim();

    // Find user and include password
    const user = await User.findOne({ email: emailNorm }).select("+password");
    console.log("📂 User found in DB:", user ? user._id : "No user");

    if (!user) {
      console.warn("❌ No user found with email:", emailNorm);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("✅ isVerified status:", user.isVerified);
    // Check if user is verified
    if (!user.isVerified) {
      console.warn("❌ User not verified:", emailNorm);
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in" });
    }

    console.log("Entered password (plain):", password);
    console.log("Stored password (hashed):", user.password);

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    console.log("✅ Tokens generated for user:", user._id);
    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    console.log("💾 Refresh token saved in DB for user:", user._id);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("🔥 Login user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send password reset OTP
    await sendPasswordResetOTP(email, otp, user.username || "User");

    res.status(200).json({
      message: "Password reset OTP sent to your email",
      userId: user._id,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2️⃣ Reset Password - verify OTP + update password + auto-login
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpiry = undefined;

    // Generate tokens (auto login)
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;

    await user.save();

    res.status(200).json({
      message: "Password reset successful, you are now logged in",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3️⃣ Resend Password Reset OTP
export const resendPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendPasswordResetOTP(email, otp, user.username || "User");

    res.status(200).json({
      message: "A new password reset OTP has been sent to your email",
    });
  } catch (error) {
    console.error("Resend password reset OTP error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
