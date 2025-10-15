import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SidebarLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-4 py-2 mb-2 rounded ${
        active ? 'bg-blue-500 text-white' : 'hover:bg-blue-100 text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

export default function TestFeedbackReport() {
  const [activeTab, setActiveTab] = useState('practice');
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(4).fill(''));
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  const questions = [
    {
      type: 'scenario',
      text: "Rewrite the following paragraph to improve its clarity and coherence.",
      paragraph:
        "Despite the rain, the game was not cancelled, but due to the wet field, players had trouble keeping their balance, which led to several minor injuries.",
    },
    {
      type: 'mcq',
      text: "Which of the following sentences is grammatically correct?",
      options: [
        "He go to school every day.",
        "He goes to school every day.",
        "He gone to school every day.",
        "He going to school every day.",
      ],
      correctAnswer: "He goes to school every day.",
    },
    {
      type: 'text',
      text: "Explain how sentence complexity can be improved in writing.",
    },
    {
      type: 'scenario',
      text: "The text below lacks coherence. Rewrite it for better logical flow.",
      paragraph: "I love to swim. The weather was bad. The pool was crowded. I had a great time.",
    },
  ];

  const handleAnswerChange = (answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentStep] = answer;
    setUserAnswers(newAnswers);
  };

  const goNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const allAnswered = userAnswers.every((ans) => ans.trim() !== '');

  const handleSubmit = () => {
    if (allAnswered) {
      setShowFeedback(true);
    }
  };

  return (
     <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-56 bg-[#5B67CA] text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold">Expressly</h2>
        </div>
        <nav className="mt-6">
          

          <SidebarLink active={activeTab === 'practice'} onClick={() => setActiveTab('practice')}>Practice</SidebarLink>
          <SidebarLink active={activeTab === 'Dashboard'} onClick={() => navigate('/dashboard')}>Dashboard</SidebarLink>
          <SidebarLink active={activeTab === 'Progress Tracking'} onClick={() => navigate('/progressTracking')}>Progress Tracking</SidebarLink>
          <SidebarLink active={activeTab === 'Leaderboard'} onClick={() => navigate('/Leaderboard')}>Leaderboard</SidebarLink>
        </nav>
      </div>
      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Test Feedback Report</h1>

        {!showFeedback ? (
          <>
            <div className="mb-4">
              <p className="text-lg font-semibold">{questions[currentStep].text}</p>
              {questions[currentStep].type === 'scenario' && (
                <p className="mt-2 text-gray-600">{questions[currentStep].paragraph}</p>
              )}
            </div>

            {questions[currentStep].type === 'mcq' ? (
              <div className="space-y-2 mb-4">
                {questions[currentStep].options.map((option, idx) => (
                  <label
                    key={idx}
                    className={`block p-2 border rounded cursor-pointer ${
                      userAnswers[currentStep] === option ? 'bg-blue-200' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentStep}`}
                      value={option}
                      checked={userAnswers[currentStep] === option}
                      onChange={() => handleAnswerChange(option)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                rows={5}
                className="w-full p-2 border rounded mb-4"
                placeholder="Type your answer here..."
                value={userAnswers[currentStep]}
                onChange={(e) => handleAnswerChange(e.target.value)}
              />
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <button
                onClick={goPrev}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded border ${
                  currentStep === 0
                    ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                    : 'hover:bg-gray-200'
                }`}
              >
                Previous
              </button>

              {currentStep === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className={`px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300`}
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="`flex items-center px-4 py-2 rounded-md bg-[#5B67CA] text-white hover:bg-[#4a56b9]"
                >
                  Next
                </button>
              )}
            </div>
          </>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Answers and Marks</h2>
            {userAnswers.map((answer, i) => (
              <div key={i} className="p-4 mb-4 bg-white border rounded shadow-sm">
                <p className="font-semibold">
                  Q{i + 1}: {questions[i].text}
                </p>
                {questions[i].type === 'scenario' && (
                  <p className="italic text-gray-600 mb-2">{questions[i].paragraph}</p>
                )}
                <p>
                  <strong>Your Answer:</strong> {answer || 'No answer provided'}
                </p>
                <p className="mt-1 text-green-600">
                  Marked: {Math.random() > 0.5 ? 'Correct' : 'Incorrect'}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
