import { useState, useEffect, useRef } from "react";
import { Camera, Upload, ArrowLeft, Video, User, Smile, Hand, Zap, CheckCircle, AlertCircle, Target, Clock, Sparkles, MessageCircle, Play, Square } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { uploadVideo } from "../utils/api";

export default function VideoAnalysisApp() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [realDuration, setRealDuration] = useState(null);
  const [error, setError] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceTask, setPracticeTask] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if we're in practice mode and load task
  useEffect(() => {
    const practice = searchParams.get('practice') === 'true';
    setIsPracticeMode(practice);
    
    if (practice) {
      const storedTask = localStorage.getItem('currentPracticeTask');
      if (storedTask) {
        try {
          setPracticeTask(JSON.parse(storedTask));
        } catch (err) {
          console.error('Error parsing practice task:', err);
        }
      }
    }
  }, [searchParams]);

  const goToDashboard = () => {
    if(isPracticeMode) { 
      navigate("/practiceExercises");
    } else { 
      navigate("/dashboard"); 
    }
  };

  const measureDuration = (url) => {
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.src = url;

    tempVideo.onloadedmetadata = () => {
      if (tempVideo.duration === Infinity) {
        tempVideo.currentTime = 1e7;
        tempVideo.ontimeupdate = () => {
          tempVideo.ontimeupdate = null;
          console.log("Real video duration :", tempVideo.duration);
          setRealDuration(tempVideo.duration);
          setResolution({ width: tempVideo.videoWidth, height: tempVideo.videoHeight });
        };
      } else {
        console.log("Real video duration:", tempVideo.duration);
        setRealDuration(tempVideo.duration);
        setResolution({ width: tempVideo.videoWidth, height: tempVideo.videoHeight });
      }
    };
  };

  const toggleRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera access is not supported on this device.");
      return;
    }

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        setError(null);
        setVideoURL(null);
        setSelectedFile(null);
        setRealDuration(null);
        setResolution(null);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!videoRef.current) {
          setError("Video element not available.");
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunks.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks.current, { type: "video/webm" });
          const file = new File([blob], "recorded-video.webm", { type: "video/webm" });

          const url = URL.createObjectURL(blob);
          setVideoURL(url);
          setSelectedFile(file);
          recordedChunks.current = [];
          stream.getTracks().forEach((track) => track.stop());
          if (videoRef.current) videoRef.current.srcObject = null;

          measureDuration(url);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        setError("Unable to access camera: " + err.message);
      }
    }
  };

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setDuration((prev) => {
          const next = prev + 1;
          if (next >= (isPracticeMode ? 120 : 300)) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
            setError(`Recording has reached the ${isPracticeMode ? '2 minute' : '5 minute'} limit and was stopped.`);
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timer);
      setDuration(0);
    }
    return () => clearInterval(timer);
  }, [isRecording, isPracticeMode]);

  const handleFileChange = (event) => {
    if (isProcessing || isPracticeMode) return;
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["video/mp4", "video/webm"];
    const maxSize = 100 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError("Only MP4 or WebM videos are allowed.");
      return;
    }

    if (file.size > maxSize) {
      setError("File size exceeds 100MB limit.");
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setVideoURL(url);
    setError(null);

    measureDuration(url);
  };

  const handleRetake = async () => {
    if (isProcessing) return;
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setVideoURL(null);
    setSelectedFile(null);
    setError(null);
    setDuration(0);
    setRealDuration(null);
    setResolution(null);
    recordedChunks.current = [];
    setIsRecording(false);

    setTimeout(() => {
      toggleRecording();
    }, 100);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    if (realDuration !== null) {
      if (realDuration < 10) {
        setError("Please record a video of at least 10 seconds.");
        return;
      }
      const maxDuration = isPracticeMode ? 120 : 300;
      if (realDuration > maxDuration) {
        setError(`Videos longer than ${isPracticeMode ? '2 minutes' : '5 minutes'} are not allowed.`);
        return;
      }
    }

    if (resolution) {
      const { height } = resolution;
      if (height < 480) {
        setError("Video resolution must be at least 480p.");
        return;
      }
    }

    try {
      setIsProcessing(true);
      setError(null);

      const res = await uploadVideo(selectedFile);
      console.log("Upload successful", res.result);

      navigate("/feedbackVideo", { 
        state: { 
          analysisResult: res.result, 
          duration: realDuration,
          isPractice: isPracticeMode,
          practiceTask: practiceTask
        } 
      });
    } catch (err) {
      setError(err);
      console.log("error on client is :", err );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={goToDashboard}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4 group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              {isPracticeMode ? 'Back to Practice' : 'Back to Dashboard'}
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] bg-clip-text text-transparent">
                {isPracticeMode ? "Body Language Practice Session" : "Body Language Analysis"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isPracticeMode 
                  ? "Complete your body language practice task" 
                  : "Analyze your posture, gestures, and expressions for confident communication"
                }
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Practice Task Info - Enhanced Styling */}
        {isPracticeMode && practiceTask && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 mb-6 text-white">
              <h2 className="text-xl font-bold mb-2 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Practice Task
              </h2>
              <p className="text-purple-100 text-sm">
                Complete this exercise to improve your body language skills
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 text-lg mb-3 border-l-4 border-blue-500 pl-3">
                {practiceTask.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 bg-blue-50 p-3 rounded-lg">
                {practiceTask.description}
              </p>
              
              {/* Instructions */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border-2 border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-blue-700">
                  <MessageCircle className="w-5 h-5 text-blue-500 mr-2" />
                  Your Task:
                </h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                  {practiceTask.instructions}
                </p>
              </div>

              {/* Pro Tips */}
              {practiceTask.additionalNotes && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center text-green-700">
                    <Sparkles className="w-5 h-5 text-green-500 mr-2" />
                    Pro Tips:
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {practiceTask.additionalNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features Overview - Only show in assessment mode */}
        {!isPracticeMode && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Professional Body Language Analysis
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get detailed feedback on your non-verbal communication to project confidence and engagement
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Posture Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Evaluate your body posture for confidence, openness, and professional presence
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Hand className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Gesture Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Assess purposeful gesture usage for engaging communication without being excessive
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Smile className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Expression Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Analyze facial expressions to ensure you appear confident, engaged, and authentic
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Instructions & Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 sticky top-8">
              {isPracticeMode ? (
                // Practice Mode Instructions
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Target className="w-5 h-5 text-blue-500 mr-2" />
                    Practice Recording
                  </h2>
                  
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">
                      Practice Mode: Recording Only
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Upload option is disabled for practice exercises
                    </p>
                  </div>
                </>
              ) : (
                // Assessment Mode Instructions
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                    Choose Input Method
                  </h2>
                </>
              )}
              
              <div className="space-y-4">
                <button
                  onClick={toggleRecording}
                  disabled={isProcessing}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                    isRecording 
                      ? 'border-red-500 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg' 
                      : 'border-gray-200 hover:border-red-300 hover:shadow-lg bg-white'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg mr-3 transition-all duration-200 ${
                      isRecording ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-lg' : 'bg-gray-100 group-hover:bg-red-100'
                    }`}>
                      {isRecording ? (
                        <Square className="w-5 h-5 text-white" />
                      ) : (
                        <Camera className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {isRecording ? "Stop Recording" : "Record Video"}
                      </h3>
                      <p className="text-sm text-gray-600">Use your camera</p>
                    </div>
                  </div>
                </button>

                {/* Disable upload button in practice mode */}
                <button
                  onClick={() => !isPracticeMode && fileInputRef.current?.click()}
                  disabled={isProcessing || isPracticeMode}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                    selectedFile && !isRecording && !isPracticeMode
                      ? 'border-[#5B67CA] bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg' 
                      : isPracticeMode
                      ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-[#5B67CA] hover:shadow-lg bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg mr-3 transition-all duration-200 ${
                      selectedFile && !isRecording && !isPracticeMode 
                        ? 'bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] shadow-lg' 
                        : isPracticeMode
                        ? 'bg-gray-300'
                        : 'bg-gray-100 group-hover:bg-blue-100'
                    }`}>
                      <Upload className={`w-5 h-5 transition-colors ${
                        selectedFile && !isRecording && !isPracticeMode 
                          ? 'text-white' 
                          : isPracticeMode
                          ? 'text-gray-500'
                          : 'text-gray-600 group-hover:text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {isPracticeMode ? "Upload Disabled" : "Upload Video"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isPracticeMode ? "Not available in practice mode" : "MP4 or WebM files"}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Requirements */}
              <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {isPracticeMode ? 'Practice Requirements:' : 'Requirements:'}
                </h4>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    {isPracticeMode ? "10 seconds to 2 minutes duration" : "10 seconds to 5 minutes duration"}
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                    Minimum 480p resolution
                  </li>
                  {!isPracticeMode && (
                    <>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                        Maximum file size: 100MB
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                        Supported: MP4, WebM
                      </li>
                    </>
                  )}
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                    Clear face and upper body visible
                  </li>
                  {isPracticeMode && (
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                      Video recording only (upload disabled)
                    </li>
                  )}
                </ul>
              </div>

              {/* Recording Timer */}
              {isRecording && (
                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-700 font-semibold text-sm flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                      Recording:
                    </span>
                    <span className="text-red-700 font-bold">{duration}s</span>
                  </div>
                  <div className="w-full bg-red-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(duration / (isPracticeMode ? 120 : 300)) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-red-600 text-xs mt-2 text-center">
                    Maximum: {isPracticeMode ? "2 minutes" : "5 minutes"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Video Preview & Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {selectedFile 
                  ? "Video Preview" 
                  : isPracticeMode 
                    ? "Start Your Practice Recording" 
                    : "Get Started"
                }
              </h2>

              {/* Video Preview */}
              <div className="mb-6">
                <video
                  ref={videoRef}
                  className="w-full max-w-2xl mx-auto rounded-xl shadow-lg border-2 border-gray-200"
                  autoPlay={isRecording}
                  muted={isRecording}
                  playsInline
                  controls={!isRecording && !!videoURL}
                  src={!isRecording && videoURL ? videoURL : undefined}
                />
                {!isRecording && !videoURL && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gradient-to-br from-gray-50 to-blue-50">
                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">
                      {isPracticeMode 
                        ? "No practice recording yet" 
                        : "No video recorded or uploaded yet"
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {isPracticeMode
                        ? "Record your practice video following the exercise instructions above"
                        : "Record a new video or upload an existing one to get started with body language analysis"
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* File Info */}
              {selectedFile && !isRecording && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Video className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">
                        {isPracticeMode ? "Practice Video Ready" : "Video Ready for Analysis"}
                      </span>
                    </div>
                    <div className="text-sm text-green-700 font-medium">
                      {selectedFile.name}
                    </div>
                  </div>
                  {realDuration && (
                    <div className="mt-2 text-sm text-green-600 flex items-center space-x-4">
                      <span className="flex items-center">
                        Duration: {Math.floor(realDuration)} seconds
                      </span>
                      <span className="flex items-center">
                        <Zap className="w-4 h-4 mr-1" />
                        Resolution: {resolution?.width}x{resolution?.height}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-700 font-medium">{error}</p>
                    <p className="text-red-600 text-sm mt-1">Please check the requirements and try again</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={isRecording || !selectedFile || isProcessing}
                  className="bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] text-white px-8 py-4 rounded-xl font-semibold hover:from-[#4a56b9] hover:to-[#7c3aed] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none group"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      {isPracticeMode ? "Analyzing Practice..." : "Analyzing Body Language..."}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Sparkles className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      {isPracticeMode ? "Submit Practice Task" : "Analyze Body Language"}
                    </div>
                  )}
                </button>

                {(videoURL || selectedFile) && !isRecording && (
                  <button
                    onClick={handleRetake}
                    disabled={isProcessing}
                    className="px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none border border-gray-300"
                  >
                    {isPracticeMode ? "Restart Practice" : "Retake Video"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden File Input - Only available in non-practice mode */}
        {!isPracticeMode && (
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        )}
      </main>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl max-w-md mx-4 border border-white/20">
            <div className="w-16 h-16 border-4 border-[#5B67CA] border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {isPracticeMode ? "Processing Your Practice" : "Processing Your Video"}
            </h3>
            <p className="text-gray-600 text-center mb-2">
              {isPracticeMode
                ? "We're analyzing your practice session against the exercise requirements."
                : "We're analyzing your body language, gestures, and expressions."
              }
            </p>
            <p className="text-gray-500 text-sm text-center">
              This may take a few minutes. Please don't close this window.
            </p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}