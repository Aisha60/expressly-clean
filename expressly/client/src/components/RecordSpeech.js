import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Upload, ArrowLeft, Volume2, MessageSquare, TrendingUp, Music } from "lucide-react";

export default function SpeechAnalysisApp() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  // Go back to Dashboard
  const goToDashboard = () => {
    navigate("/dashboard");
  };

  // Start/Stop recording
  const toggleRecording = async () => {
    setError(null);

    if (selectedFile) {
      setError("You cannot record while a file is uploaded.");
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Microphone access is not supported on this device.");
      return;
    }

    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        let localChunks = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) localChunks.push(event.data);
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(localChunks, { type: "audio/wav" });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);

          setSelectedFile(new File([audioBlob], "recording.wav", { type: "audio/wav" }));

          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        setAudioUrl(null);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Microphone access is blocked. Please allow microphone access.");
      }
    } else {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
        setMediaRecorder(null);
      }
    }
  };

  // Timer for recording
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setDuration((prev) => {
          const next = prev + 1;
          if (next >= 120) {
            if (mediaRecorder) {
              mediaRecorder.stop();
              setIsRecording(false);
              setMediaRecorder(null);
            }
            setError("Recording has reached the 2 minute limit and was stopped.");
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timer);
      setDuration(0);
    }
    return () => clearInterval(timer);
  }, [isRecording, mediaRecorder]);

  // File Upload (only mp3/m4a/wav allowed)
  const handleFileChange = (event) => {
    if (isRecording) {
      setError("You cannot upload a file while recording.");
      return;
    }

    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/x-m4a", "audio/wav"];
      if (!allowedTypes.includes(file.type)) {
        setError("Only MP3, M4A, or WAV files are allowed.");
        setSelectedFile(null);
        setAudioUrl(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  // Reset recording/upload
  const resetRecording = () => {
    setAudioUrl(null);
    setSelectedFile(null);
    setError(null);
  };

  // Submit final audio
  const uploadRecording = async () => {
    try {
      setError(null);

      if (!selectedFile) {
        setError("Please record or upload a file first.");
        return;
      }

      const audio = new Audio(audioUrl);
      await new Promise((resolve) => {
        audio.onloadedmetadata = () => resolve();
      });

      const fileDuration = audio.duration;
      if (fileDuration < 10) {
        setError("Audio must be at least 10 seconds long.");
        return;
      }
      if (fileDuration > 120) {
        setError("Audio must not be longer than 2 minutes.");
        return;
      }

      setIsUploading(true);

      const formData = new FormData();
      formData.append("audio", selectedFile);

      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      console.log("✅ File uploaded:", data);

      if (!data.scoring || !data.summary || !data.recordingInfo) {
        throw new Error("Missing required data from server response");
      }

      navigate("/feedbackSpeech", {
        state: {
          feedback: {
            scoring: data.scoring,
            summary: data.summary,
            recordingInfo: data.recordingInfo
          },
          cleanedFilePath: data.cleanedFilePath,
          transcription: data.transcription,
          pronunciation: data.pronunciation,
          fluency: data.fluency,
          pitch: data.pitch,
          toneAnalysis: data.toneAnalysis,
        },
        replace: true
      });
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={goToDashboard}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] bg-clip-text text-transparent">
                Speech Analysis
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Analyze your pronunciation, fluency, tone, and pitch for effective communication
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Features Overview */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Professional Speech Analysis
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get detailed feedback on your speaking skills to communicate with clarity and confidence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Pronunciation</h3>
              <p className="text-gray-600 text-sm">
                Evaluate word clarity and accuracy for better articulation
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Fluency</h3>
              <p className="text-gray-600 text-sm">
                Assess speech flow, pace, and natural rhythm
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Music className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Pitch & Tone</h3>
              <p className="text-gray-600 text-sm">
                Analyze vocal variety and emotional expression
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                <Volume2 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Voice Quality</h3>
              <p className="text-gray-600 text-sm">
                Measure vocal strength and delivery effectiveness
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Mode Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Input Method</h2>
              <div className="space-y-4">
                <button
                  onClick={toggleRecording}
                  disabled={isUploading || selectedFile}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    isRecording 
                      ? 'border-red-500 bg-red-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  } ${(isUploading || selectedFile) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg mr-3 ${
                      isRecording ? 'bg-red-500' : 'bg-gray-100'
                    }`}>
                      <Mic className={`w-5 h-5 ${
                        isRecording ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {isRecording ? "Stop Recording" : "Record Audio"}
                      </h3>
                      <p className="text-sm text-gray-600">Use your microphone</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isRecording}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedFile && !isRecording
                      ? 'border-[#5B67CA] bg-purple-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  } ${(isUploading || isRecording) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg mr-3 ${
                      selectedFile && !isRecording ? 'bg-[#5B67CA]' : 'bg-gray-100'
                    }`}>
                      <Upload className={`w-5 h-5 ${
                        selectedFile && !isRecording ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Upload Audio</h3>
                      <p className="text-sm text-gray-600">MP3, M4A, or WAV</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Requirements */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 text-sm mb-2">Requirements:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• 10 seconds to 2 minutes duration</li>
                  <li>• Maximum file size: 50MB</li>
                  <li>• Supported: MP3, M4A, WAV</li>
                  <li>• Clear audio with minimal background noise</li>
                </ul>
              </div>

              {/* Recording Timer */}
              {isRecording && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-red-700 font-semibold text-sm">Recording:</span>
                    <span className="text-red-700 font-bold">{duration}s</span>
                  </div>
                  <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(duration / 120) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-red-600 text-xs mt-1">Max: 2 minutes</p>
                </div>
              )}
            </div>
          </div>

          {/* Audio Preview & Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedFile ? "Audio Preview" : "Get Started"}
              </h2>

              {/* Audio Preview */}
              <div className="mb-6">
                {audioUrl ? (
                  <div className="border-2 border-gray-200 rounded-xl p-8 bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#5B67CA] to-[#8B5CF6] rounded-full flex items-center justify-center">
                        <Volume2 className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <audio 
                      controls 
                      src={audioUrl} 
                      className="w-full max-w-md mx-auto"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                    <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No audio recorded or uploaded yet.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Record a new audio or upload an existing one to get started.
                    </p>
                  </div>
                )}
              </div>

              {/* File Info */}
              {selectedFile && !isRecording && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Volume2 className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">Audio Ready</span>
                    </div>
                    <div className="text-sm text-green-700">
                      {selectedFile.name}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
                  <div className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0">⚠</div>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={uploadRecording}
                  disabled={isRecording || !selectedFile || isUploading}
                  className="bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] text-white px-8 py-3 rounded-xl font-semibold hover:from-[#4a56b9] hover:to-[#7c3aed] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Analyze Speech'
                  )}
                </button>

                {(audioUrl || selectedFile) && !isRecording && (
                  <button
                    onClick={resetRecording}
                    disabled={isUploading}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.m4a,.wav,audio/mpeg,audio/mp3,audio/x-m4a,audio/wav"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading || isRecording}
        />
      </main>

      {/* Processing Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-xl max-w-md mx-4">
            <div className="w-16 h-16 border-4 border-[#5B67CA] border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Processing Your Audio</h3>
            <p className="text-gray-600 text-center mb-2">
              We're analyzing your pronunciation, fluency, pitch, and tone.
            </p>
            <p className="text-gray-500 text-sm text-center">
              This may take a few moments. Please don't close this window.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}