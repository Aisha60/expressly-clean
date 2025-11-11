
import axios from 'axios';

// Base URL
const BASE_URL = 'http://localhost:5000/api';

// -------------------- SIGNUP --------------------
// Step 1: Signup - send user info to backend, triggers OTP
export const signup = async (userData) => {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'Signup failed');

  // Returns { success: true, message: 'OTP sent to email' }
  return data;
};

// Step 2: Verify OTP - completes signup, receives token + user
export const verifyOtp = async ({ email, otp }) => {
  const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'OTP verification failed');

  // Save token + user in localStorage
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data; // { success: true, token, user }
};

// -------------------- LOGIN --------------------
export const login = async (credentials) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'Login failed');

  // Save token + user details
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));

  console.log("Login successful. Token:", data.token, "User:", data.user);

  return data;
};

// -------------------- UPDATE PROFILE --------------------
export const updateUserProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${BASE_URL}/auth/update-profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'Failed to update profile');

  return data.user;
};

// -------------------- DELETE ACCOUNT --------------------
export const deleteUserAccount = async (email, password) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');
  if (!email || !password) throw new Error('Email and password are required');

  const response = await fetch(`${BASE_URL}/auth/delete-account`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'Failed to delete account');

  // Clear localStorage after deletion
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  console.log('Account deleted successfully');
  return data;
};

// -------------------- FORGOT PASSWORD --------------------
export const forgotPassword = async ({ email }) => {
  const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
  return data;
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const response = await fetch(`${BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to reset password');
  return data;
};

// upload video API
export const uploadVideo = async (file) => {
  if (!file) throw new Error("No file provided");

  const user = JSON.parse(localStorage.getItem("user")); 
  const userId = user?._id;

  if (!userId) throw new Error("User ID not found in local storage");
  
  const formData = new FormData();
  formData.append("video", file);
  formData.append("userId", userId); 
  
try {
const res = await axios.post(`${BASE_URL}/upload/video`, formData, {
    headers: { "Content-Type": "multipart/form-data" ,},
  });
  
  console.log("Successful repsonse is:" , res.data);
  return res.data;
} catch (error) {
  console.error("Upload video error:", error.response?.data);
  let errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to upload video";
    
  if (error.response?.data?.suggestion) {
      errorMessage += "\n\nSuggestion: " + error.response.data.suggestion;
    }

  throw errorMessage; 
  }
};


// Submit file for analysis (text extraction + Python analysis)
export const submitFileAnalysis = async (file) => {
  const user = JSON.parse(localStorage.getItem("user")); 
  const userId = user?._id;


  if (!userId) throw new Error("User ID not found in local storage");
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId);
  
  try {
    const res = await axios.post(`${BASE_URL}/analyze-file`, formData, {
      headers: { 
        "Content-Type": "multipart/form-data" 
      },
      timeout: 120000, // 2 minutes for file processing + Python analysis
    });
    
    console.log("File analysis successful with res.data:", res.data);

    return res.data;
  } catch (error) {
    console.error("File analysis error:", error);
    let errorMessage = "Failed to analyze file. Please try again.";
    let suggestion = "Please try with a different file or type text directly.";
    
    if (error.response?.data) {
      errorMessage = error.response.data.message || error.response.data.error || errorMessage;
      suggestion = error.response.data.suggestion || suggestion;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = "Analysis is taking too long.";
      suggestion = "Please try again with a smaller file or different format.";
    }

    const fullError = `${errorMessage}\n\nSuggestion: ${suggestion}`;
    throw fullError; 
  }
};

// Submit text for analysis
export const submitTextAnalysis = async (textData) => {
  const user = JSON.parse(localStorage.getItem("user")); 
  const userId = user?._id;

  if (!userId) throw new Error("User ID not found in local storage");
  
  const payload = {
    text: textData.text,
    userId: userId,
    source: textData.source
  };
  
  try {
    const res = await axios.post(`${BASE_URL}/analyze-text`, payload, {
      headers: { 
        "Content-Type": "application/json" 
      },
      timeout: 60000, // 1 minute for text analysis
    });
    
    console.log("Text analysis successful with res.data:", res.data);

    return res.data;

  } catch (error) {
    console.error("Text analysis error:", error);
    let errorMessage = "Failed to analyze text. Please try again.";
    let suggestion = "Please check your text and try again.";
    
    if (error.response?.data) {
      errorMessage = error.response.data.message || error.response.data.error || errorMessage;
      suggestion = error.response.data.suggestion || suggestion;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = "Analysis is taking too long.";
      suggestion = "Please try again with a shorter text.";
    }

    const fullError = `${errorMessage}\n\nSuggestion: ${suggestion}`;
    throw fullError; 
  }
};

// -------------------- PROGRESS / LEADERBOARD --------------------
export const getProgressSessions = async (userId) => {
  if (!userId) throw new Error('User ID required');
  const res = await axios.get(`${BASE_URL}/progress/sessions`, { params: { userId } });
  return res.data;
};

export const getProgressSummary = async (userId) => {
  if (!userId) throw new Error('User ID required');
  const res = await axios.get(`${BASE_URL}/progress/summary`, { params: { userId } });
  return res.data;
};

export const getSessionDetail = async (type, id) => {
  if (!type || !id) throw new Error('type and id required');
  const res = await axios.get(`${BASE_URL}/progress/session/${type}/${id}`);
  return res.data;
};

export const getLeaderboard = async (type = 'overall', days = 7) => {
  const res = await axios.get(`${BASE_URL}/progress/leaderboard`, { params: { type, days } });
  return res.data;
};

export const getBadges = async (userId) => {
  if (!userId) throw new Error('User ID required');
  const res = await axios.get(`${BASE_URL}/progress/badges`, { params: { userId } });
  return res.data;
};


// -------------------- PRACTICE EXERCISES --------------------

// Helper to get user ID from localStorage
const getUserId = () => {
  const user = JSON.parse(localStorage.getItem("user")); 
  if (user._id) {
      return user._id;
    }
    return null;
};

// Generate practice task API
export const generate_PracticeTask = async (moduleType) => {
  try {
    const userId = getUserId();
    
    if (!userId) {
      throw new Error('User not found. Please login again.');
    }

    console.log("sending API req for:", {userId, moduleType});

    const response = await axios.post(`${BASE_URL}/practice/generate-task`, {
      userId: userId,
      moduleType: moduleType
    });
    
    console.log("Practice task returned is:" , response.data)
    return response.data;
    
  } catch (error) {
    console.error('Generate practice task error:', error);
    throw error.response?.data || error;
  }
};


