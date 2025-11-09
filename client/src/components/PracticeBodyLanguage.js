import { useState, useRef, useEffect } from 'react';
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

export default function BodyLanguagePractice() {
  const [activeTab, setActiveTab] = useState('practice');
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(3).fill(''));
  const [showFeedback, setShowFeedback] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoURL, setRecordedVideoURL] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const navigate = useNavigate();

  // Start webcam on mount or when practice tab is active
  useEffect(() => {
    if (activeTab === 'practice' && !showFeedback) {
      async function enableCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error('Error accessing webcam:', err);
        }
      }
      enableCamera();

      return () => {
        // Stop webcam when leaving or showing feedback
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        // Cleanup recorded video URL
        if (recordedVideoURL) {
          URL.revokeObjectURL(recordedVideoURL);
          setRecordedVideoURL(null);
        }
      };
    }
  }, [activeTab, showFeedback]);

  const questions = [
    {
      type: 'scenario',
      text: 'Adjust your posture: sit or stand straight with your shoulders relaxed and back.',
    },
    {
      type: 'scenario',
      text: 'Practice open gestures: keep your hands visible and avoid crossing your arms.',
    },
    {
      type: 'scenario',
      text: 'Maintain appropriate eye contact: look directly at the camera to simulate engagement.',
    },
  ];

  const handleAnswerChange = (answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentStep] = answer;
    setUserAnswers(newAnswers);
  };

  const goNext = () => {
    if (currentStep < questions.length - 1) setCurrentStep(currentStep + 1);
  };

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // Start recording the video stream
  const startRecording = () => {
    if (videoRef.current?.srcObject) {
      recordedChunksRef.current = [];
      const options = { mimeType: 'video/webm; codecs=vp9' };
      try {
        mediaRecorderRef.current = new MediaRecorder(videoRef.current.srcObject, options);
      } catch (e) {
        console.error('Exception while creating MediaRecorder:', e);
        return;
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoURL(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = () => {
    setShowFeedback(true);
    // Stop webcam on submit
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-56 bg-[#5B67CA] text-white flex flex-col justify-between">
        <div className="p-4">
          <h2 className="text-xl font-bold">Expressly</h2>
        </div>
        <nav className="mt-6 flex-grow">
          <SidebarLink active={activeTab === 'practice'} onClick={() => setActiveTab('practice')}>
            Practice
          </SidebarLink>
          <SidebarLink active={activeTab === 'Dashboard'} onClick={() => navigate('/dashboard')}>
            Dashboard
          </SidebarLink>
          <SidebarLink active={activeTab === 'Progress Tracking'} onClick={() => navigate('/progressTracking')}>
            Progress Tracking
          </SidebarLink>
          <SidebarLink active={activeTab === 'Leaderboard'} onClick={() => navigate('/Leaderboard')}>
            Leaderboard
          </SidebarLink>
        </nav>
      </div>

      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Body Language Practice</h1>

        {!showFeedback ? (
          <div className="max-w-3xl mx-auto">
            {/* Camera preview */}
            <div className="mb-6">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full max-w-md rounded border border-gray-300 shadow"
                aria-label="Webcam preview for body language practice"
              />
              <p className="text-center text-sm text-gray-600 mt-1">
                Use this video preview to practice your body language.
              </p>
            </div>

            {/* Recording controls */}
            <div className="mb-4 flex gap-4 justify-center">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  aria-label="Start recording video"
                >
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-900"
                  aria-label="Stop recording video"
                >
                  Stop Recording
                </button>
              )}
            </div>

            {/* Show recorded video */}
            {recordedVideoURL && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Recorded Video Preview:</h3>
                <video
                  src={recordedVideoURL}
                  controls
                  className="w-full max-w-md rounded border border-gray-300 shadow"
                  aria-label="Recorded body language video"
                />
              </div>
            )}

            <p className="text-lg mb-4 font-semibold">{questions[currentStep].text}</p>
            <textarea
              rows={5}
              className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe how you would correct or perform this body language aspect."
              value={userAnswers[currentStep]}
              onChange={(e) => handleAnswerChange(e.target.value)}
            />
            <div className="flex justify-between">
              <button
                onClick={goPrev}
                disabled={currentStep === 0}
                className="px-4 py-2 rounded border hover:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300"
              >
                Previous
              </button>
              {currentStep === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Your Answers</h2>
            {userAnswers.map((answer, i) => (
              <div key={i} className="p-4 mb-4 bg-white border rounded shadow-sm">
                <p className="font-semibold">
                  Q{i + 1}: {questions[i].text}
                </p>
                <p className="mt-2">
                  <strong>Your Answer:</strong> {answer || 'No answer provided'}
                </p>
                <p className={`mt-1 ${answer.trim() ? 'text-green-600' : 'text-red-600'}`}>
                  {answer.trim() ? 'Great effort! Remember to practice these tips.' : 'Try again. Your response can be improved.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
