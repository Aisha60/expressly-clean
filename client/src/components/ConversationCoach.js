import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Video, X, Mic, Settings, Info, Download } from 'lucide-react';

export default function ConversationCoach() {
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  const feedback = `Conversation Feedback

Flow: 7/10
Tip: Try to connect your ideas more smoothly by using transition words like "therefore", "however", or "next".

Coherence: 8/10
Tip: Keep your responses focused and avoid jumping between unrelated points.

Relevance: 6/10
Tip: Ensure your replies directly address the question or topic being discussed.`;

  const navigate = useNavigate();

  const endSession = () => {
    setIsSessionActive(false);
    setShowFeedback(true);
  };

  const startNewSession = () => {
    setIsSessionActive(true);
    setShowFeedback(false);
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const downloadFeedback = () => {
    const element = document.createElement("a");
    const file = new Blob([feedback], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "conversation-feedback.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-[#5B67CA] text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6" />
          <h1 className="text-xl font-bold">Conversation Coach</h1>
        </div>
        <div className="flex space-x-4">
          <button className="hover:bg-[#4A56B9] p-2 rounded-full">
            <Info className="h-5 w-5" />
          </button>
          <button className="hover:bg-[#4A56B9] p-2 rounded-full">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-6 flex flex-col bg-white">
        {isSessionActive ? (
          <>
            {/* Panels */}
            <div className="flex flex-1 gap-6 mb-6">
              {/* Bot */}
              <div className="w-1/2 bg-gray-100 rounded-xl shadow-md flex flex-col overflow-hidden">
                <div className="bg-[#5B67CA] p-3 text-white font-medium">AI Assistant</div>
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-[#5B67CA] mb-4">
                      <div className="w-24 h-24 relative">
                        <div className="absolute top-8 left-0 w-full flex justify-between">
                          <div className="w-3 h-3 bg-[#5B67CA] rounded-full"></div>
                          <div className="w-3 h-3 bg-[#5B67CA] rounded-full"></div>
                        </div>
                        <div className="absolute bottom-6 left-4 right-4 h-2 bg-[#5B67CA] rounded-full"></div>
                        <div className="absolute bottom-4 left-6 right-6 h-2 bg-[#5B67CA] rounded-full scale-x-75"></div>
                      </div>
                    </div>
                    <span className="text-[#5B67CA] font-medium">Listening...</span>
                  </div>
                </div>
              </div>

              {/* Video */}
              <div className="w-1/2 bg-gray-100 rounded-xl shadow-md overflow-hidden flex flex-col">
                <div className="bg-[#5B67CA] p-3 text-white font-medium flex justify-between">
                  <span>Your Video</span>
                  <div className="flex space-x-2">
                    <button className="hover:bg-[#4A56B9] p-1 rounded">
                      <Mic className="h-4 w-4" />
                    </button>
                    <button className="hover:bg-[#4A56B9] p-1 rounded">
                      <Video className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center bg-gray-200 p-4">
                  <div className="text-gray-500 flex flex-col items-center">
                    <Video className="h-12 w-12 mb-2" />
                    <span className="font-medium">Your video will appear here</span>
                    <span className="text-sm">Camera permissions required</span>
                  </div>
                </div>
              </div>
            </div>

            {/* End Session Button */}
            <div className="flex justify-center pb-4">
              <button 
                onClick={endSession}
                className="bg-[#5B67CA] hover:bg-[#4A56B9] text-white font-medium py-3 px-8 rounded-full shadow-md flex items-center"
              >
                <X className="mr-2 h-5 w-5" /> End Session
              </button>
            </div>
          </>
        ) : showFeedback ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-gray-100 p-8 rounded-xl shadow-md max-w-md w-full">
              <h2 className="text-xl font-bold text-[#5B67CA] mb-4 text-center">Session Feedback</h2>
              <pre className="whitespace-pre-wrap text-gray-700 mb-6">{feedback}</pre>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={downloadFeedback}
                  className="bg-[#5B67CA] hover:bg-[#4A56B9] text-white font-medium py-2 px-6 rounded-full shadow-md flex items-center justify-center"
                >
                  <Download className="mr-2 h-5 w-5" /> Download Feedback
                </button>
                <button 
                  onClick={startNewSession}
                  className="bg-[#5B67CA] hover:bg-[#4A56B9] text-white font-medium py-2 px-6 rounded-full shadow-md"
                >
                  New Session
                </button>
                <button 
                  onClick={goToDashboard}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-6 rounded-full shadow-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="text-center text-gray-500 text-sm">
          © 2025 Conversation Coach | Practice anytime, anywhere
        </div>
      </footer>
    </div>
  );
}
