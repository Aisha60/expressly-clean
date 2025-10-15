import { useState, useRef } from "react";
import { ArrowLeft, Mic, RefreshCcw, Star, ChevronRight } from "lucide-react";

const GEMINI_API_KEY = "AIzaSyCMpgu6UlX0MKlGQO5VY4SpZ8BLSGR2LRE";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Helper function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function PracticeSpeech() {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(0);

  const timerRef = useRef(null);

  const goToDashboard = () => {
    alert("Navigate to dashboard - replace with: navigate('/dashboard')");
  };

  const featureMap = {
    Pronunciation: "Pronunciation",
    Fluency: "Fluency",
    Tone: "Tone",
    "Pitch Variation": "Pitch",
  };

  // Exercise metadata
  const exerciseDetails = {
    Pronunciation: {
      description: "Work on clearly articulating challenging word combinations and sounds.",
      // duration: "5-7 min",
      difficulty: 2,
      category: "Pronunciation"
    },
    Tone: {
      description: "Practice matching your emotional tone with content in persuasive speech segments.",
      // duration: "6-8 min",
      difficulty: 2,
      category: "Tone Analysis"
    },
    Fluency: {
      description: "Improve your speaking flow and reduce hesitations during longer speeches.",
      // duration: "5-7 min",
      difficulty: 2,
      category: "Fluency"
    },
    "Pitch Variation": {
      description: "Improve pitch changes to maintain audience engagement during longer speeches.",
      // duration: "6-8 min",
      difficulty: 10,
      category: "Pitch Variation"
    }
  };

  // Exercise-specific configurations
  const exercisePrompts = {
    Pronunciation: {
      prompt: "Generate 10 short, natural phrases with challenging pronunciation. Each phrase must be 3-6 words and include words with specific sounds like th, r, l, or consonant clusters. Don't include any instructions.",
      fallback: [
        "Three fresh strawberries",
        "Sixth street theater",
        "Blue leather shoes",
        "Bright morning light",
        "Clean clear water",
      ]
    },
    Fluency: {
      prompt: "Generate 10 natural conversational phrases that you might use daily. Each must be 3-6 words and flow smoothly. Don't include any instructions.",
      fallback: [
        "How are you today?",
        "Nice to meet you",
        "See you next time",
        "What's the weather like?",
        "Can we meet tomorrow?"
      ]
    },
    Tone: {
      prompt: "Generate 10 emotional scenarios with a response line. Format: {Scenario} -> {Response line} [emotion]. Each scenario should be 1-2 sentences. Response should be 10-8 words. Emotions: excited, sympathetic, angry, happy, worried, proud, sad.",
      fallback: [
        "You just got accepted into your dream university! -> I can't believe I made it! [excited]",
        "Your friend tells you they lost their beloved pet. -> I'm here for you, stay strong [sympathetic]",
        "Someone cut in line ahead of you at the store. -> Please wait your turn! [angry]",
        "Your team won the championship match. -> We did it, what a victory! [happy]",
        "Your friend is going through a tough time. -> Everything will be okay [worried]"
      ]
    },
    "Pitch Variation": {
      prompt: "Generate 10 questions with varying intonation. Each must be 10-6 words. Mark with [rising] or [falling] for pitch pattern. Don't include any instructions.",
      fallback: [
        "Where are you going? [rising]",
        "Stop right there! [falling]",
        "Can you help me? [rising]",
        "What a beautiful day! [falling]",
        "Are you sure? [rising]"
      ]
    }
  };

  // Generate questions from Gemini
  const generateQuestions = async (exerciseType) => {
    setLoading(true);
    try {
      const config = exercisePrompts[exerciseType] || exercisePrompts.Pronunciation;

      const response = await fetch(
        `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: config.prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Process and validate questions
      let questions = text
        .split(/\d+\.\s+|\\n/)
        .map(q => q.trim())
        .filter(q => {
          if (!q) return false;
          
          // Special handling for tone exercise scenarios
          if (exerciseType === "Tone") {
            const parts = q.split("->");
            if (parts.length !== 2) return false;
            
            const [scenario, response] = parts.map(p => p.trim());
            // Validate scenario length and response format
            const hasEmotion = /\[(excited|sympathetic|angry|happy|worried|proud|sad)\]$/i.test(response);
            const responseWords = response.split(' ').length;
            return scenario.split(' ').length >= 5 && 
                   responseWords >= 10 && 
                   responseWords <= 8 && 
                   hasEmotion;
          }
          
          // For other exercise types
          const words = q.split(' ').length;
          const hasInstructions = q.toLowerCase().includes('repeat') || 
                                q.toLowerCase().includes('times') ||
                                q.toLowerCase().includes('practice');
          return words >= 2 && words <= 6 && !hasInstructions;
        });

      // Use fallback if we don't have enough valid questions
      if (questions.length < 10) {
        questions = shuffleArray([...config.fallback]).slice(0, 10);
      } else {
        questions = questions.slice(0, 10); // Only take first 10 questions
      }

      setQuestions(questions);
      setSelectedExercise(exerciseType);
      setCurrentIndex(0);
      setUserAnswers([]);
      setScore(null);
    } catch (err) {
      console.error("Error generating questions:", err);
      // Use fallback questions on error
      const fallbacks = exercisePrompts[exerciseType]?.fallback || exercisePrompts.Pronunciation.fallback;
      setQuestions(shuffleArray([...fallbacks]).slice(0, 10));
      setSelectedExercise(exerciseType);
      setCurrentIndex(0);
      setUserAnswers([]);
      setScore(null);
    } finally {
      setLoading(false);
    }
  };

  // Recording functions
  const toggleRecording = async () => {
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("❌ Microphone not supported");
      return;
    }

    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        let chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          if (timerRef.current) clearInterval(timerRef.current);
          const blob = new Blob(chunks, { type: "audio/wav" });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setSelectedFile(new File([blob], "recording.wav", { type: "audio/wav" }));
          stream.getTracks().forEach((track) => track.stop());
          setDuration(0);
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        setAudioUrl(null);

        // Start timer
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error(err);
        setError("❌ Microphone access blocked");
      }
    } else {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
        setMediaRecorder(null);
      }
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setSelectedFile(null);
    setError(null);
    setDuration(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Submit recorded answer for evaluation
  const submitAnswer = async () => {
    if (!selectedFile) {
      setError("❌ Please record your answer first.");
      return;
    }

    try {
      setIsUploading(true);
      
      // Convert audio file to base64
      const audioBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(selectedFile);
      });

      const res = await fetch("http://localhost:5001/evaluate-feature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          audioData: audioBase64,
          feature: featureMap[selectedExercise],
          question: questions[currentIndex]
        })
      });

      const data = await res.json();
      console.log("Evaluation result:", data);
      const isCorrect = data.isCorrect;

      const updatedAnswers = [...userAnswers, isCorrect ? 1 : 0];
      setUserAnswers(updatedAnswers);

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        resetRecording();
      } else {
        const totalCorrect = updatedAnswers.reduce((a, b) => a + b, 0);
        setScore(totalCorrect);
      }
    } catch (err) {
      console.error(err);
      setError("❌ Submission failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // Exercise Selection View
  if (!selectedExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <ArrowLeft 
                className="w-6 h-6 cursor-pointer text-gray-700 hover:text-[#5B67CA] transition-colors" 
                onClick={goToDashboard} 
              />
              <div className="flex-1 text-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] bg-clip-text text-transparent">
                  Practice Exercises
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Improve your speaking skills with targeted exercises
                </p>
              </div>
              <div className="w-6"></div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6">
            <div className="text-center mb-8 mt-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Choose Your Practice
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select an exercise type to start your personalized practice session
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["Pronunciation", "Tone", "Fluency", "Pitch Variation"].map((ex) => (
                <ExerciseCard 
                  key={ex} 
                  exercise={{
                    title: ex,
                    ...exerciseDetails[ex],
                    focused: ex === "Tone" || ex === "Pitch Variation"
                  }}
                  onStart={() => generateQuestions(ex)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading View
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#5B67CA] mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Generating exercises...</p>
          <p className="text-sm text-gray-500 mt-2">This will take just a moment</p>
        </div>
      </div>
    );
  }

  // Score View
  if (score !== null) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-12 h-12 text-white" fill="white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Exercise Completed!</h1>
            <p className="text-gray-600">Great work on completing all questions</p>
          </div>
          
          <div className="bg-gradient-to-r from-[#5B67CA]/10 to-[#8B5CF6]/10 rounded-2xl p-6 mb-6">
            <p className="text-5xl font-bold bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] bg-clip-text text-transparent mb-2">
              {percentage}%
            </p>
            <p className="text-lg text-gray-700">
              {score} out of {questions.length} correct
            </p>
          </div>

          <button
            className="w-full px-6 py-3 bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] hover:from-[#4a56b9] hover:to-[#7c3aed] text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            onClick={() => setSelectedExercise(null)}
          >
            Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  // Practice View
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSelectedExercise(null)}
              className="flex items-center text-[#5B67CA] hover:text-[#4a56b9] transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              <span className="font-medium">Back to exercises</span>
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-gray-800">{selectedExercise} Practice</h1>
              <p className="text-sm text-gray-600 mt-1">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="w-full bg-white/50 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 text-sm font-medium bg-[#D4D7F2] text-[#5B67CA] rounded-full mb-4">
              {exerciseDetails[selectedExercise].category}
            </span>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Practice Content</h2>
            <div className="space-y-4">
              {selectedExercise === "Tone" ? (
                <>
                  <div className="bg-gradient-to-r from-[#5B67CA]/5 to-[#8B5CF6]/5 p-6 rounded-xl">
                    <h3 className="text-sm font-medium text-[#5B67CA] mb-2">Scenario</h3>
                    <p className="text-lg text-gray-800 leading-relaxed">
                      {questions[currentIndex].split("->")[0].trim()}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-[#5B67CA]/5 to-[#8B5CF6]/5 p-6 rounded-xl border-l-4 border-[#5B67CA]">
                    <h3 className="text-sm font-medium text-[#5B67CA] mb-2">Read with appropriate emotion</h3>
                    <p className="text-lg text-gray-800 leading-relaxed font-medium">
                      {questions[currentIndex].split("->")[1].trim()}
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-gradient-to-r from-[#5B67CA]/5 to-[#8B5CF6]/5 p-6 rounded-xl border-l-4 border-[#5B67CA]">
                  <p className="text-lg text-gray-800 leading-relaxed">
                    {questions[currentIndex]}
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="bg-[#D4D7F2] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Record Your Response</h3>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-6 mb-4">
                <button 
                  onClick={toggleRecording}
                  className={`p-5 rounded-full ${
                    isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#5B67CA]'
                  } text-white hover:shadow-lg transition-all duration-200`}
                >
                  <Mic size={32} />
                </button>
                
                {audioUrl && (
                  <button 
                    onClick={resetRecording}
                    className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    <RefreshCcw size={24} />
                  </button>
                )}
              </div>
              
              {isRecording && (
                <p className="text-gray-700 font-medium mb-4">
                  Recording... {duration}s
                </p>
              )}
              
              {!isRecording && !audioUrl && (
                <p className="text-gray-600 mb-4">
                  Click the microphone to start recording
                </p>
              )}
              
              {audioUrl && (
                <div className="w-full max-w-md mb-4">
                  <audio src={audioUrl} controls className="w-full" />
                </div>
              )}
            </div>
          </div>
        </div>
{/* 
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tips for Success</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <ChevronRight className="text-[#5B67CA] mr-2 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-gray-600">Speak clearly and at a natural pace</p>
            </li>
            <li className="flex items-start">
              <ChevronRight className="text-[#5B67CA] mr-2 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-gray-600">Focus on the specific skill being practiced</p>
            </li>
            <li className="flex items-start">
              <ChevronRight className="text-[#5B67CA] mr-2 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-gray-600">Take your time - quality over speed</p>
            </li>
          </ul>
        </div> */}

        <button
          className={`w-full px-6 py-4 bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] hover:from-[#4a56b9] hover:to-[#7c3aed] text-white text-lg font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg ${
            isUploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={submitAnswer}
          disabled={isUploading}
        >
          {isUploading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Evaluating...
            </span>
          ) : (
            currentIndex + 1 === questions.length ? "Submit & Finish" : "Submit Answer"
          )}
        </button>
      </main>
    </div>
  );
}

function ExerciseCard({ exercise, onStart }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-3">
          <span className="inline-block px-3 py-1 text-sm font-medium bg-[#D4D7F2] text-[#5B67CA] rounded-full">
            {exercise.category}
          </span>
          {/* <div className="flex">
            {[...Array(exercise.difficulty)].map((_, i) => (
              <Star key={i} size={16} className="text-yellow-400" fill="#FBBF24" />
            ))}
            {[...Array(3 - exercise.difficulty)].map((_, i) => (
              <Star key={i + exercise.difficulty} size={16} className="text-gray-300" />
            ))}
          </div> */}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{exercise.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{exercise.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">{exercise.duration} • 3 questions</span>
          <button 
            onClick={onStart}
            className="px-6 py-2 bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] hover:from-[#4a56b9] hover:to-[#7c3aed] text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Start Exercise
          </button>
        </div>
      </div>
    </div>
  );
}