import { useState } from "react";
import { Mail, Lock, AlertCircle, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as api from '../utils/api';
import Logo from './reusable/Logo';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1); // 1: email, 2: otp+new password
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const navigate = useNavigate();

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setServerError("");
        setSuccessMsg("");
        try {
            await api.forgotPassword({ email });
            setStep(2);
            setSuccessMsg("OTP sent to your email ");
        } catch (err) {
            setServerError(err.message || "Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setServerError("");
        setSuccessMsg("");
        try {
            await api.resetPassword({ email, otp, newPassword });
            setSuccessMsg("Password reset successful! You can now log in.");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setServerError(err.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 relative overflow-hidden p-4">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 backdrop-blur-xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 backdrop-blur-xl" />
            <div className="bg-white/95 rounded-xl shadow-2xl w-full max-w-md z-10 relative transition-transform hover:scale-[1.01] duration-300">
                <div className="p-8">
                    <div className="flex flex-col items-center justify-center mb-8">
                        <Logo />
                    </div>
                    <h2 className="text-center font-bold text-2xl mb-8 text-gray-800 tracking-wide">
                        Forgot Password
                    </h2>
                    {serverError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{serverError}</p>
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 text-sm">{successMsg}</p>
                        </div>
                    )}
                    {step === 1 ? (
                        <form className="space-y-6" onSubmit={handleEmailSubmit}>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                                    <input
                                        type="email"
                                        placeholder="Enter your registered email"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 border border-gray-200"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2"
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending..." : "Send OTP"}
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={handleResetSubmit}>
                            <div className="space-y-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter OTP"
                                        className="w-full pl-4 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 border border-gray-200"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 border border-gray-200"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2"
                                disabled={isLoading}
                            >
                                {isLoading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}