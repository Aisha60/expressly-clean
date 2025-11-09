import { useState } from 'react';
import { ArrowUpCircle, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CompleteAnalysisFeedbackReport() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const analysisData = {
    recordDate: "April 29, 2025",
    recordTime: "10:00 am",
    duration: "6m 45s",
    overallScore: 78,

    bodyLanguage: {
      overallScore: 76,
      metrics: [
        { title: "Posture", score: 60, improvement: 2, color: "bg-blue-500" },
        { title: "Arm position", score: 72, improvement: 7, color: "bg-green-500" },
        { title: "Hand position", score: 80, improvement: 2, color: "bg-teal-500" },
        { title: "Lower body position", score: 82, improvement: 3, color: "bg-purple-500" }
      ],
      analysis: {
        posture: "Shoulders appear slightly slouched...",
        strengths: "Excellent hand position...",
        improvementAreas: "Posture needs attention...",
        recommendations: "Practice shoulder alignment exercises..."
      }
    },

    speech: {
      overallScore: 80,
      metrics: [
        { title: "Pronunciation", score: 85, improvement: 5, color: "bg-indigo-500" },
        { title: "Pace", score: 75, improvement: 3, color: "bg-yellow-500" },
        { title: "Tone", score: 78, improvement: 4, color: "bg-red-400" },
        { title: "Clarity", score: 82, improvement: 6, color: "bg-pink-500" }
      ],
      analysis: {
        pronunciation: "Pronunciation is generally clear...",
        strengths: "Good variation in tone...",
        improvementAreas: "Pace can be inconsistent...",
        recommendations: "Practice slowing down..."
      }
    }
  };

  const handleDownload = () => {
    const reportContent = `EXPRESSLY - COMPLETE COMMUNICATION ANALYSIS FEEDBACK REPORT
Recorded: ${analysisData.recordDate} • ${analysisData.recordTime} • Duration: ${analysisData.duration}
Combined Overall Score: ${analysisData.overallScore}/100

BODY LANGUAGE ANALYSIS:
Overall Score: ${analysisData.bodyLanguage.overallScore}/100
Metrics:
${analysisData.bodyLanguage.metrics.map(m => `- ${m.title}: ${m.score}% (${m.improvement}% Improvement)`).join('\n')}

Details:
Posture: ${analysisData.bodyLanguage.analysis.posture}
Strengths: ${analysisData.bodyLanguage.analysis.strengths}
Improvement Areas: ${analysisData.bodyLanguage.analysis.improvementAreas}
Recommendations: ${analysisData.bodyLanguage.analysis.recommendations}

SPEECH ANALYSIS:
Overall Score: ${analysisData.speech.overallScore}/100
Metrics:
${analysisData.speech.metrics.map(m => `- ${m.title}: ${m.score}% (${m.improvement}% Improvement)`).join('\n')}

Details:
Pronunciation: ${analysisData.speech.analysis.pronunciation}
Strengths: ${analysisData.speech.analysis.strengths}
Improvement Areas: ${analysisData.speech.analysis.improvementAreas}
Recommendations: ${analysisData.speech.analysis.recommendations}`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'complete_communication_analysis_report.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const navigateToPractice = () => {
    navigate('/practiceCommunication');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-56 bg-[#5B67CA] text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold">Expressly</h2>
        </div>
        <nav className="mt-6">
          <SidebarLink active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</SidebarLink>
          <SidebarLink active={activeTab === 'Dashboard'} onClick={() => navigate('/dashboard')}>Dashboard</SidebarLink>
          <SidebarLink active={activeTab === 'Progress Tracking'} onClick={() => navigate('/progressTracking')}>Progress Tracking</SidebarLink>
          <SidebarLink active={activeTab === 'Leaderboard'} onClick={() => navigate('/Leaderboard')}>Leaderboard</SidebarLink>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="bg-white shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-800">Complete Communication Analysis Feedback Report</h1>
            <div className="text-sm text-gray-500 mt-1">
              Recorded: {analysisData.recordDate} • {analysisData.recordTime} • Duration: {analysisData.duration}
            </div>
          </header>

          <main className="p-6">
            {/* Overall Score */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Overall Performance</h2>
                <p className="text-gray-500 mt-1">Summary of your communication performance (speech & body language)</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E6E6E6"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#5B67CA"
                      strokeWidth="3"
                      strokeDasharray={`${analysisData.overallScore}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{analysisData.overallScore}</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mt-2">Overall Score</p>
              </div>
            </div>

            {/* Body Language Metrics */}
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Body Language Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {analysisData.bodyLanguage.metrics.map((metric, i) => (
                <ScoreCard
                  key={"body-" + i}
                  title={metric.title}
                  score={metric.score}
                  improvement={metric.improvement}
                  color={metric.color}
                />
              ))}
            </div>

            {/* Posture Analysis */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Posture Analysis</h3>
                <p className="text-gray-600">{analysisData.bodyLanguage.analysis.posture}</p>
              </div>
              <div className="md:w-1/3">
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src="/api/placeholder/240/320"
                    alt="Posture analysis"
                    className="w-full h-48 object-cover object-center"
                  />
                  <div className="p-3 text-sm text-gray-500 text-center">
                    Time stamp: 2:36 (Standing posture)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Body Language Performance Summary</h3>
              <p><strong>Strengths:</strong> {analysisData.bodyLanguage.analysis.strengths}</p>
              <p><strong>Improvement Areas:</strong> {analysisData.bodyLanguage.analysis.improvementAreas}</p>
              <p><strong>Recommendations:</strong> {analysisData.bodyLanguage.analysis.recommendations}</p>
            </div>

            {/* Speech Metrics */}
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Speech Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {analysisData.speech.metrics.map((metric, i) => (
                <ScoreCard
                  key={"speech-" + i}
                  title={metric.title}
                  score={metric.score}
                  improvement={metric.improvement}
                  color={metric.color}
                />
              ))}
            </div>

            {/* Speech Analysis */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Speech Analysis</h3>
              <p><strong>Pronunciation:</strong> {analysisData.speech.analysis.pronunciation}</p>
              <p><strong>Strengths:</strong> {analysisData.speech.analysis.strengths}</p>
              <p><strong>Improvement Areas:</strong> {analysisData.speech.analysis.improvementAreas}</p>
              <p><strong>Recommendations:</strong> {analysisData.speech.analysis.recommendations}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-[#5B67CA] text-white px-5 py-3 rounded-md hover:bg-[#4b55a7] transition"
              >
                <Download size={20} /> Download Report
              </button>
              <button
                onClick={navigateToPractice}
                className="flex items-center gap-2 border border-[#5B67CA] text-[#5B67CA] px-5 py-3 rounded-md hover:bg-[#5B67CA] hover:text-white transition"
              >
                <ArrowUpCircle size={20} /> Practice Communication
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ children, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center w-full px-6 py-3 text-left ${
        active ? 'bg-[#4a56b9] font-medium' : 'hover:bg-[#4a56b9] transition-colors'
      }`}
    >
      {children}
    </button>
  );
}

// Score Card Component
function ScoreCard({ title, score, improvement, color }) {
  return (
    <div className="bg-[#D4D7F2] rounded-lg p-5">
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      <div className="relative h-2 bg-gray-200 rounded-full mb-4">
        <div 
          className={`absolute top-0 left-0 h-full rounded-full ${color}`} 
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex items-center">
        <span className="text-xl font-bold">{score}%</span>
        <div className="flex items-center ml-auto text-green-600 text-sm">
          <ArrowUpCircle size={16} className="mr-1" />
          {improvement}% Improvement
        </div>
      </div>
    </div>
  );
}