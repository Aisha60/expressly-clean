import { useState } from "react";
import { Mail, Lock, User, AlertCircle, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import Logo from './reusable/Logo';

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = user info, 2 = OTP
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const navigate = useNavigate();
  const { signup, verifyOtp } = useAuth();

  const passwordRequirements = [
    { test: (p) => p.length >= 8, text: "At least 8 characters" },
    { test: (p) => /[^A-Za-z0-9]/.test(p), text: "One special character" },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!fullName) newErrors.fullName = "Full name is required";
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email";

    if (!password) newErrors.password = "Password is required";
    else {
      const failedRequirements = passwordRequirements.filter(req => !req.test(password));
      if (failedRequirements.length > 0) newErrors.password = "Password does not meet requirements";
    }

    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError('');

    try {
      await signup({ fullName, email, password }); // Step 1: send OTP
      setStep(2); // move to OTP verification
    } catch (error) {
      console.log("Signup error:", error);
      setServerError(error.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      const response = await verifyOtp({ email, otp }); // Step 2: verify OTP
      console.log("OTP verified, response:", response);
      navigate('/dashboard'); // redirect after successful signup
    } catch (error) {
      console.log("OTP verification error:", error);
      setServerError(error.message || "OTP verification failed.");
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

          {step === 1 ? (
            <>
              <h2 className="text-center font-bold text-2xl mb-8 text-gray-800 tracking-wide">Create Account</h2>
              {serverError && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-600 text-sm">{serverError}</p></div>}
              <form className="space-y-6" onSubmit={handleSignupSubmit}>
                {/* Full Name */}
                <div className="space-y-2">
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${
                        errors.fullName ? 'border-red-500 focus:ring-red-200' : 'focus:ring-indigo-200 border-transparent'
                      } transition-all duration-200`}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  {errors.fullName && <div className="flex items-center gap-1 text-red-500 text-sm pl-1"><AlertCircle size={14} /><span>{errors.fullName}</span></div>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${
                        errors.email ? 'border-red-500 focus:ring-red-200' : 'focus:ring-indigo-200 border-transparent'
                      } transition-all duration-200`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {errors.email && <div className="flex items-center gap-1 text-red-500 text-sm pl-1"><AlertCircle size={14} /><span>{errors.email}</span></div>}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                    <input
                      type="password"
                      placeholder="Password"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${
                        errors.password ? 'border-red-500 focus:ring-red-200' : 'focus:ring-indigo-200 border-transparent'
                      } transition-all duration-200`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {errors.password && <div className="flex items-center gap-1 text-red-500 text-sm pl-1"><AlertCircle size={14} /><span>{errors.password}</span></div>}
                  <div className="space-y-1 mt-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {req.test(password) ? <Check size={14} className="text-green-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
                        <span className={req.test(password) ? "text-green-700" : "text-gray-500"}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${
                        errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'focus:ring-indigo-200 border-transparent'
                      } transition-all duration-200`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  {errors.confirmPassword && <div className="flex items-center gap-1 text-red-500 text-sm pl-1"><AlertCircle size={14} /><span>{errors.confirmPassword}</span></div>}
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 flex items-center justify-center font-semibold tracking-wide shadow-lg shadow-indigo-200 disabled:opacity-70">
                  {isLoading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : "Create Account"}
                </button>
              </form>
            </>
          ) : (
            // Step 2: OTP Verification
            <>
              <h2 className="text-center font-bold text-2xl mb-8 text-gray-800 tracking-wide">Enter OTP</h2>
              {serverError && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-600 text-sm">{serverError}</p></div>}
              <form className="space-y-6" onSubmit={handleOtpSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className={`w-full pl-4 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${
                      errors.otp ? 'border-red-500 focus:ring-red-200' : 'focus:ring-indigo-200 border-transparent'
                    } transition-all duration-200`}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                {errors.otp && <div className="flex items-center gap-1 text-red-500 text-sm pl-1"><AlertCircle size={14} /><span>{errors.otp}</span></div>}
                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 flex items-center justify-center font-semibold tracking-wide shadow-lg shadow-indigo-200 disabled:opacity-70">
                  {isLoading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : "Verify OTP"}
                </button>
              </form>
            </>
          )}

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">Already have an account?</p>
            <button type="button" onClick={() => navigate("/login")} className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors duration-200 tracking-wide mt-1">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}