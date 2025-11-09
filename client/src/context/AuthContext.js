import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../utils/api.js'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async(credentials) => {
    const {user, token} = await api.login(credentials);
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    console.log("Login successful, user:", user, " token:", token);
    return { user, token };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log("Logout successful — user and token cleared.");
    navigate('/login');
  };

  // Step 1: send user data to backend (no token yet)
  const signup = async(userData) => {
    const response = await api.signup(userData); // backend sends OTP
    console.log("Signup initiated (OTP sent), response:", response);
    return response; // just return backend message
  };

  // Step 2: verify OTP and store token + user
  const verifyOtp = async({ email, otp }) => {
    const { user, token } = await api.verifyOtp({ email, otp });
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    console.log("OTP verified — user and token stored:", user, token);
    return { user, token };
  };

  const value = {
    user,
    login,
    logout,
    signup,
    verifyOtp,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;