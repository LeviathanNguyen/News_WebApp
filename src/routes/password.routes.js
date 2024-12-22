import e from "express";
import passwordController from "../controllers/passwordController"

const router = e.Router();

// Send OTP to user's email
router.post("/forgot-password", passwordController.sendOtp);

// Verify OTP and go to reset-password page
router.post("/verify-otp", passwordController.verifyOtp);

// Reset password
router.post("/reset-password", passwordController.resetPassword);

export default router;
