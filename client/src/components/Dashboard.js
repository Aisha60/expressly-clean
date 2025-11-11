import { useState, useRef, useEffect } from 'react';
import { Search, Mic, Users, FileText, MessageSquare, Bot, Award, X, Star, Trophy, Shield, Target, Zap, CheckSquare, ChevronRight, User, Mail, Lock, Eye, EyeOff, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, deleteUserAccount } from '../utils/api';
import Sidebar from './reusable/Sidebar';
import FeatureCard from './reusable/FeatureCard';
import BadgeCard from './reusable/BadgeCard';
import CopyrightFooter from './reusable/CopyrightFooter';

export default function Dashboard() {
  const [progress, setProgress] = useState(76);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [fullName, setFullName] = useState(user.fullName || 'User');
  const [email, setEmail] = useState(user.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  // Badge data
  const [userBadges, setUserBadges] = useState([]);
  const userFromStorage = JSON.parse(localStorage.getItem('user')) || {};

  // map badge ids to icons/levels
  const badgeMeta = {
    rising_star: { icon: <Star size={24} />, level: 'gold' },
    consistent_practitioner: { icon: <Award size={24} />, level: 'silver' },
    top_communicator: { icon: <Mic size={24} />, level: 'gold' },
    grammar_guru: { icon: <FileText size={24} />, level: 'gold' },
    body_language_ace: { icon: <Users size={24} />, level: 'gold' },
  };

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const { getBadges } = await import('../utils/api');
        const res = await getBadges(userFromStorage._id);
        if (res?.success) {
          const enriched = res.badges.map(b => ({
            ...b,
            icon: badgeMeta[b.id]?.icon || <Trophy size={24} />,
            level: badgeMeta[b.id]?.level || 'bronze'
          }));
          setUserBadges(enriched);
        }
      } catch (e) {
        console.error('Failed to load badges', e);
      }
    };
    loadBadges();
  }, []);

  const features = [
    { 
      icon: <Mic size={24} />, 
      title: "SPEECH ANALYSIS", 
      description: "Analyze pronunciation, tone, and fluency",
      onClick: () => navigate('/recordAudio'),
      color: "from-blue-500 to-cyan-500"
    },
    { 
      icon: <Users size={24} />, 
      title: "BODY LANGUAGE ANALYSIS", 
      description: "Improve posture, gestures, and expressions",
      onClick: () => navigate('/recordVideo'),
      color: "from-purple-500 to-pink-500"
    },
    { 
      icon: <FileText size={24} />, 
      title: "DOCUMENT ANALYSIS", 
      description: "Enhance writing clarity and structure",
      onClick: () => navigate('/writeText'),
      color: "from-green-500 to-emerald-500"
    },
    { 
      icon: <MessageSquare size={24} />, 
      title: "CONVERSATION COACH", 
      description: "Practice real-world dialogues",
      onClick: () => navigate('/conversationCoach'),
      color: "from-orange-500 to-red-500"
    },
    { 
      icon: <Bot size={24} />, 
      title: "CONVERSO BOT", 
      description: "AI-powered conversation practice",
      onClick: () => navigate('/chatbot'),
      color: "from-indigo-500 to-purple-500"
    },
    { 
      icon: <Award size={24} />, 
      title: "PRACTICE TASKS", 
      description: "Complete exercises to boost your skills",
      onClick: () => navigate('/practiceExercises'),
      color: "from-yellow-500 to-amber-500"
    },
  ];

  const filteredFeatures = features.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Enhanced Badges Modal
  const BadgesModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20">
        <div className="flex justify-between items-center border-b border-gray-100 p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Your Achievement Badges
            </h2>
            <p className="text-gray-600 mt-1">Track your progress and unlock new skills</p>
          </div>
          <button
            onClick={() => setShowBadgesModal(false)}
            className="p-2 hover:bg-white rounded-xl transition-all duration-200 hover:scale-110"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Progress Summary */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 mr-3">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Progress Summary</h3>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-indigo-100 text-sm">Badges Collected</p>
                  <p className="text-2xl font-bold mt-1">3 of 6</p>
                  <p className="text-indigo-200 text-sm mt-2">Keep practicing to unlock more achievements!</p>
                </div>
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeDasharray="50, 100"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">50%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>

          {/* How to Earn Section */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">How to earn more badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <Target className="w-8 h-8 text-blue-600 mb-2" />
                <h4 className="font-semibold text-blue-800 mb-1">Complete Sessions</h4>
                <p className="text-sm text-blue-700">Finish practice sessions in each skill area</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <Trophy className="w-8 h-8 text-green-600 mb-2" />
                <h4 className="font-semibold text-green-800 mb-1">Reach Scores</h4>
                <p className="text-sm text-green-700">Achieve high scores in assessments</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <Award className="w-8 h-8 text-purple-600 mb-2" />
                <h4 className="font-semibold text-purple-800 mb-1">Stay Consistent</h4>
                <p className="text-sm text-purple-700">Maintain regular practice streaks</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <button
            onClick={() => setShowBadgesModal(false)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );

  const toggleProfileMenu = () => {
    setShowProfileMenu(prev => !prev);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    try {
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error('New passwords do not match');
        }
      }
      const updatedUser = await updateUserProfile({
        fullName,
        email,
        password: newPassword || undefined
      });

      localStorage.setItem('user', JSON.stringify({
        ...updatedUser,
        newPassword: '',
        confirmPassword: ''
      }));

      setFullName(updatedUser.fullName);
      setEmail(updatedUser.email);
      setNewPassword('');
      setConfirmPassword('');
      setShowEditModal(false);
      setCurrentPassword('');
      setEditError('');
    } catch (error) {
      setEditError(error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditProfile = () => {
    setShowProfileMenu(false);
    setShowEditModal(true);
  };

  const handleViewBadges = () => {
    setShowProfileMenu(false);
    setShowBadgesModal(true);
  };

  const handleDeleteProfile = () => {
    setShowProfileMenu(false);
    setShowDeleteModal(true);
  };

  // Enhanced Edit Profile Modal
  const EditProfileModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="flex justify-between items-center border-b border-gray-100 p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Edit Profile
            </h2>
            <p className="text-gray-600 text-sm mt-1">Update your personal information</p>
          </div>
          <button 
            onClick={() => setShowEditModal(false)}
            className="p-2 hover:bg-white rounded-xl transition-all duration-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleProfileUpdate} className="p-6">
          {editError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {editError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-gray-400" />
                New Password (optional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-xl transition-colors"
              disabled={editLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={editLoading}
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const passwordInputRef = useRef(null);

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setDeleteError('');
    setDeletePassword('');
  };

  useEffect(() => {
    if (showDeleteModal && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [showDeleteModal]);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');
    setDeleteLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.email) {
        throw new Error('User data not found');
      }
      await deleteUserAccount(userData.email, deletePassword);
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const DeleteAccountModal = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="flex justify-between items-center border-b border-gray-100 p-6 bg-gradient-to-r from-red-50 to-orange-50">
          <div>
            <h2 className="text-xl font-bold text-red-600">Delete Account</h2>
            <p className="text-red-600 text-sm mt-1">This action cannot be undone</p>
          </div>
          <button onClick={handleDeleteModalClose} className="p-2 hover:bg-white rounded-xl">
            <X size={20} className="text-red-500" />
          </button>
        </div>
        
        {deleteError && (
          <div className="mx-6 mt-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {deleteError}
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <p className="text-center text-gray-700 mb-2">
            Are you sure you want to delete your account?
          </p>
          <p className="text-center text-gray-500 text-sm mb-6">
            All your data, progress, and achievements will be permanently lost.
          </p>
          
          <form onSubmit={handleDeleteAccount}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your password to confirm
              </label>
              <input
                ref={passwordInputRef}
                type="password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Your password"
                disabled={deleteLoading}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleDeleteModalClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-xl transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Sidebar />

      {/* Main Content Column */}
      <div className="flex flex-col flex-1">

        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 p-6 flex items-center justify-between shadow-sm relative z-40">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {fullName}!
            </h2>
            <p className="text-gray-600 text-sm mt-1">Ready to improve your communication skills today?</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Enhanced Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search features..."
                className="bg-gray-100/80 backdrop-blur-sm rounded-xl py-2.5 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 border border-transparent hover:border-gray-300"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Enhanced Profile Menu - Fixed z-index issue */}
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-lg">
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">{fullName}</p>
                  <p className="text-xs text-gray-500">Premium User</p>
                </div>
                <ChevronRight size={16} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-90' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 z-60 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-semibold text-gray-800">{fullName}</p>
                    <p className="text-sm text-gray-500 truncate">{email}</p>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={handleEditProfile}
                      className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      Edit Profile
                    </button>
                    <button
                      onClick={handleViewBadges}
                      className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Award className="w-4 h-4 mr-3 text-gray-400" />
                      View Badges
                    </button>
                  </div>
                  
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={handleDeleteProfile}
                      className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Enhanced Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Enhanced Progress Section - Reduced z-index */}
          <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-700 rounded-2xl p-8 shadow-xl border border-white/20 relative overflow-hidden mb-8 z-10">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold text-white mb-2">Your Progress Overview</h2>
              <p className="text-indigo-100 mb-6 text-lg">Overall Communication Score</p>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-5xl font-bold text-white mb-2">{progress}</p>
                  <p className="text-indigo-200">out of 100 points</p>
                </div>
                
                <div className="text-right">
                  <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm p-1">
                    <div className="h-full w-full rounded-full bg-transparent border-4 border-white border-t-transparent flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="h-3 w-full bg-indigo-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-white to-cyan-200 rounded-full shadow-lg transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Practice Tools</h2>
              <p className="text-gray-500 text-sm">
                {filteredFeatures.length} of {features.length} features
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeatures.length > 0 ? (
                filteredFeatures.map((feature, i) => (
                  <FeatureCard
                    key={i}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    onClick={feature.onClick}
                    color={feature.color}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Search size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No features match your search</p>
                  <p className="text-gray-400 text-sm mt-2">Try different keywords</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <CopyrightFooter />
      </div>

      {/* Modals */}
      {showBadgesModal && <BadgesModal />}
      {showEditModal && <EditProfileModal />}
      {showDeleteModal && DeleteAccountModal}
    </div>
  );
}