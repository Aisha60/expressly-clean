// File: Login.js
import { useState } from "react";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import Logo from './reusable/Logo';

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const redirectMsg = location.state?.msg || "";

  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError('');

    try {
      await login({ email, password });
      navigate(from, { replace: true });

    } catch (error) {
      setServerError(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const goToSignUp = () => navigate("/signup");


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 relative overflow-hidden p-4">
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 backdrop-blur-xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 backdrop-blur-xl" />

      <div className="bg-white/100  rounded-xl shadow-2xl w-full max-w-md z-10 relative transition-transform hover:scale-[1.01] duration-300">
        <div className="p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <Logo />
          </div>
          <h2 className="text-center font-bold text-2xl mb-8 text-gray-800 tracking-wide">Welcome Back</h2>
          
          {redirectMsg && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">{redirectMsg}</p>
            </div>
          )}

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{serverError}</p>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                <input
                  type="email"
                  placeholder="Email or Username"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'focus:ring-indigo-200 border-transparent'
                    } transition-all duration-200`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-1 text-red-500 text-sm pl-1">
                  <AlertCircle size={14} />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                <input
                  type="password"
                  placeholder="Password"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'focus:ring-indigo-200 border-transparent'
                    } transition-all duration-200`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 text-red-500 text-sm pl-1">
                  <AlertCircle size={14} />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 flex items-center justify-center font-semibold tracking-wide shadow-lg shadow-indigo-200 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                "Log In"
              )}
            </button>


          </form>

          <div className="text-center mt-6">
            <button
              type="button"
              className="text-indigo-600 text-sm hover:text-indigo-700 transition-colors duration-200 hover:underline"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </button>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">Don't have an Account?</p>
            <button
              type="button"
              onClick={goToSignUp}
              className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors duration-200 tracking-wide mt-1"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}