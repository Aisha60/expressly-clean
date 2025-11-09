import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  PenLine,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const initialChatsByScenario = {
  "Job Interview": [
    {
      text: "Hello! I am your Interview Practice Assistant. Ready for your interview today for the Junior Web Developer position?",
      sender: "bot",
    },
    {
      text: "Yes, I'm ready. Can you give me a quick summary of what to expect?",
      sender: "user",
    },
    {
      text: "Just to get the vibe right, can you tell me a bit about the role you're applying for? Like is it front-end, back-end, full-stack, QA, data-related, DevOps, etc?",
      sender: "bot",
    },
  ],
  "Casual Chat": [
    { text: "Hey! How's your day going so far?", sender: "bot" },
    { text: "Pretty good, thanks! Just relaxing a bit. How about you?", sender: "user" },
    { text: "I'm doing well, thanks! So, what do you usually like to do on weekends?", sender: "bot" },
  ],
};

export default function ConversoBot() {
  const navigate = useNavigate();

  const [currentScenario, setCurrentScenario] = useState("Job Interview");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showScenarioDropdown, setShowScenarioDropdown] = useState(false);
  const [showFeedbackScreen, setShowFeedbackScreen] = useState(false);

  const chatEndRef = useRef(null);
  const scenarios = Object.keys(initialChatsByScenario);

  useEffect(() => {
    const scenarioMessages = initialChatsByScenario[currentScenario] || [];
    const firstBotMessage = scenarioMessages.find((msg) => msg.sender === "bot");
    setMessages(firstBotMessage ? [firstBotMessage] : []);
  }, [currentScenario]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [...prev, { text: newMessage, sender: "user" }]);
    setNewMessage("");

    setTimeout(() => {
      const scenarioMessages = initialChatsByScenario[currentScenario] || [];
      const nextMsg = scenarioMessages[messages.length];
      setMessages((prev) => [
        ...prev,
        nextMsg?.sender === "bot"
          ? nextMsg
          : { text: "Thanks for your message! Let's keep practicing.", sender: "bot" },
      ]);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndSession = () => {
    if (messages.length > 1) {
      setShowFeedbackScreen(true);
    } else {
      navigate("/dashboard");
    }
  };

  const handleStartNewSession = () => {
    setShowFeedbackScreen(false);
    setMessages([]);
  };

  const handleDownloadReport = () => {
    const report = messages
      .map((msg) => `${msg.sender === "user" ? "You" : "Bot"}: ${msg.text}`)
      .join("\n");

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "conversobot_report.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const feedbackScores = {
    relevance: 8,
    flow: 7,
    coherence: 7,
  };

  const feedbackTips = [
    "Try to stay more on topic to improve relevance.",
    "Organize your thoughts better to improve flow.",
    "Use clearer transitions to improve coherence.",
  ];

  const goBack = () => navigate("/dashboard");

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#5B67CA] px-6 py-4 flex justify-between items-center shadow-md">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={goBack}
        >
          <ArrowLeft size={24} className="text-white" />
          <MessageSquare className="text-white" size={24} />
          <h1 className="text-white text-xl font-semibold">Converso Bot</h1>
        </div>
        <div className="flex items-center space-x-3">
          <RefreshCw className="text-white cursor-pointer" />
          <PenLine className="text-white cursor-pointer" />
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="bg-white px-6 py-3 flex items-center justify-between border-b shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="text-black-200 font-medium">Current Scenario:</span>
          <div className="relative">
            <button
              className="bg-[#5B67CA] text-white px-3 py-1 rounded-md flex items-center"
              onClick={() => setShowScenarioDropdown(!showScenarioDropdown)}
            >
              {currentScenario}
            </button>
            {showScenarioDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md border z-10 w-48">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario}
                    className="px-4 py-2 hover:bg-[#D4D7F2] cursor-pointer"
                    onClick={() => {
                      setCurrentScenario(scenario);
                      setShowScenarioDropdown(false);
                    }}
                  >
                    {scenario}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm"
          onClick={handleEndSession}
        >
          End Session
        </button>
      </div>

      {/* Feedback Screen */}
      {showFeedbackScreen ? (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Feedback Summary</h2>

            <div className="mb-4 space-y-2">
              {Object.entries(feedbackScores).map(([key, score]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize font-medium">{key}:</span>
                  <span className="text-blue-600">{score}/10</span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Improvement Tips</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {feedbackTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleDownloadReport}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Download Report
              </button>
              <button
                onClick={handleStartNewSession}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Start New
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-4 max-w-[80%] ${
                    msg.sender === "user" ? "ml-auto" : "mr-auto"
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl shadow-sm ${
                      msg.sender === "user"
                        ? "bg-[#D2E7F0] text-gray-900 rounded-tr-none"
                        : "bg-[#D9D9D9] text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white border-t p-4">
            <div className="max-w-3xl mx-auto flex items-center">
              <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2 border border-gray-300">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent focus:outline-none text-gray-800"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={handleSendMessage}
                  className="ml-2 text-[#5B67CA] hover:text-[#4A56B9]"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
