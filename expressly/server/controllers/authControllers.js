import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOTPEmail } from "../utils/mailer.js";

// Helper to generate token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || "your-jwt-secret", {
        expiresIn: "7d",
    });
};

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc Initiate signup (send OTP)
export const initiateSignup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Generate OTP and expiration (5 mins)
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        // Create temporary user (not verified yet)
        const user = new User({ fullName, email, password, otp, otpExpires, isVerified: false });
        await user.save();

        // Send OTP email
        await sendOTPEmail(email, otp);

        res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        console.error("Signup initiation error:", error);
        res.status(500).json({ success: false, message: "Error initiating signup", error: error.message });
    }
};

// @desc Verify OTP and complete signup
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.isVerified) return res.status(400).json({ success: false, message: "User already verified" });

        if (user.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });

        if (user.otpExpires < new Date()) return res.status(400).json({ success: false, message: "OTP expired" });

        // Mark user as verified and clear OTP fields
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Signup completed successfully",
            token,
            user: user.toJSON(),
        });
    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({ success: false, message: "Error verifying OTP", error: error.message });
    }
};

// @desc Login user
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByEmail(email);
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (!user.isVerified) return res.status(401).json({ success: false, message: "Email not verified" });

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: user.toJSON(),
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Login failed", error: error.message });
    }
};

// @desc Delete account
export const deleteAccount = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        await user.deleteOne();
        res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ success: false, message: "Error deleting account", error: error.message });
    }
};

// @desc Update profile
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const { fullName, email, password } = req.body;
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (password) user.password = password;

        const updatedUser = await user.save();

        res.json({ success: true, message: "Profile updated successfully", user: updatedUser.toJSON() });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ success: false, message: "Error updating profile", error: error.message });
    }
};

// @desc Test DB
export const testDatabase = async (req, res) => {
    try {
        await User.findOne({});
        res.json({ success: true, message: "Database connection is working" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error", error: error.message });
    }
};

// @desc Forgot Password - send OTP to email
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Invalid email. No user found." });
        }
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        await sendOTPEmail(email, otp);
        res.status(200).json({ success: true, message: "OTP sent to your email." });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ success: false, message: "Error sending OTP", error: error.message });
    }
};

// @desc Reset Password - verify OTP and set new password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        if (user.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
        if (user.otpExpires < new Date()) return res.status(400).json({ success: false, message: "OTP expired" });
        user.password = newPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ success: false, message: "Error resetting password", error: error.message });
    }
};