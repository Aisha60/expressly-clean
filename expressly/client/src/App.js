

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Login from './components/Login.js';
import Signup from './components/SignUp.js';
import Landing from './components/Landing.js';
import Dashboard from './components/Dashboard.js';
import Leaderboard from './components/Leaderboard.js';
import Progress from './components/Progress.js';
import RecordVideo from './components/RecordVideo.js';
import RecordSpeech from './components/RecordSpeech.js';
import WriteText from './components/WriteText.js';
import Chatbot from './components/chatbot.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import ConversationCoach from './components/ConversationCoach.js';
import SpeechAnalysisFeedbackReport from './components/FeedbackSpeech.js';
import ToneMatchingExercise from './components/SpeechPractice.js';
import TextFeedbackReport from './components/FeedbackText.js';
import BodyLanguageReport from './components/FeedbackVideo.js';
import PracticeExercises from './components/PracticeExercises.js';


// ProtectedRoute
const ProtectedRoute = ({ children, message }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, msg: message }}
        replace
      />
    );
  }

  return children;
};


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute message="Please log in to access your dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/Leaderboard"
            element={
              <ProtectedRoute message="Please log in to access the leaderboard">
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/Progress"
            element={
              <ProtectedRoute message="Please log in to access your progress">
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recordVideo"
            element={
              <ProtectedRoute message="Please log in to record video practice">
                <RecordVideo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recordAudio"
            element={
              <ProtectedRoute message="Please log in to record your speech">
                <RecordSpeech />
              </ProtectedRoute>
            }
          />
          <Route
            path="/writeText"
            element={
              <ProtectedRoute message="Please log in to write text practice">
                <WriteText />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute message="Please log in to chat with AI coach">
                <Chatbot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conversationCoach"
            element={
              <ProtectedRoute message="Please log in to access Conversation Coach">
                <ConversationCoach />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedbackSpeech"
            element={
              <ProtectedRoute message="Please log in to view speech feedback">
                <SpeechAnalysisFeedbackReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedbackText"
            element={
              <ProtectedRoute message="Please log in to view text feedback">
                <TextFeedbackReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedbackVideo"
            element={
              <ProtectedRoute message="Please log in to view video feedback">
                <BodyLanguageReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practiceSpeech"
            element={
              <ProtectedRoute message="Please log in to practice your speech">
                <ToneMatchingExercise />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practiceExercises"
            element={
              <ProtectedRoute message="Please log in to access communication exercises">
                <PracticeExercises />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
