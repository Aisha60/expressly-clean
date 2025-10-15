import express from "express";
import {
    initiateSignup,
    verifyOTP,
    login,
    deleteAccount,
    updateProfile,
    testDatabase,
    forgotPassword,
    resetPassword,
} from "../controllers/authControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", initiateSignup);  // Step 1: Send OTP
router.post("/verify-otp", verifyOTP);  // Step 2: Verify OTP and complete signup
router.post("/login", login);
router.delete("/delete-account", deleteAccount);
router.put("/update-profile", protect, updateProfile);
router.get("/test-db", testDatabase);
router.post("/forgot-password", forgotPassword); // Step 1: send OTP for password reset
router.post("/reset-password", resetPassword);   // Step 2: verify OTP and set new password

export default router;