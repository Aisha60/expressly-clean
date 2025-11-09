import { useState, useEffect, useRef } from "react";
import { Camera, FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function VideoAnalysisApp() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate("/dashboard");
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

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunks.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks.current, {
            type: "video/webm",
          });
          setVideoURL(URL.createObjectURL(blob));
          recordedChunks.current = [];
          stream.getTracks().forEach((track) => track.stop());
          if (videoRef.current) videoRef.current.srcObject = null;
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
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
      setDuration(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log("Uploaded File:", file);
    }
  };

  const handleRetake = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setVideoURL(null);
    setSelectedFile(null);
    setError(null);
    setDuration(0);
    setIsRecording(false);
    recordedChunks.current = [];
  };

  return (
    <div className="min-h-screen">
      <header className="bg-[#5B67CA] text-white p-4 shadow-lg flex items-center">
        <ArrowLeft
          className="w-6 h-6 cursor-pointer hover:text-gray-200 mr-4"
          onClick={goToDashboard}
          aria-label="Go to Dashboard"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") goToDashboard();
          }}
        />
        <div className="mx-auto">
          <h1 className="text-xl font-bold">Video Analysis</h1>
        </div>
      </header>

      <main className="container bg-white mx-auto p-6">
        {error && (
          <div
            className="text-red-600 text-center mb-4"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-8">
          <div
            className="border border-[#5B67CA] rounded-lg p-8 flex flex-col items-center justify-center shadow-lg cursor-pointer select-none"
            onClick={toggleRecording}
            role="button"
            aria-label={isRecording ? "Stop Recording" : "Start Recording"}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggleRecording();
            }}
          >
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <div
                className={`w-10 h-10 ${
                  isRecording ? "bg-red-500" : "bg-[#5B67CA]"
                } rounded-full flex items-center justify-center`}
              >
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-lg font-medium text-center text-gray-800">
              {isRecording ? "Stop Recording" : "Record Video"}
            </span>
          </div>

          <div
            className="border border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center shadow-lg cursor-pointer"
            role="button"
            aria-label="Upload File"
          >
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <FileText className="w-10 h-10 text-gray-800 mb-2" />
              <span className="text-lg font-medium text-center text-gray-800">
                Upload a File
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* Display Selected File */}
            {selectedFile && (
              <div className="mt-4 text-center text-lg text-gray-800">
                Selected File: {selectedFile.name}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <video
            ref={videoRef}
            className="w-full max-w-md mx-auto"
            autoPlay={isRecording}
            muted={isRecording}
            playsInline
            controls={!isRecording && !!videoURL}
            src={!isRecording && videoURL ? videoURL : undefined}
          />
          {!isRecording && !videoURL && (
            <p className="text-center text-gray-600">No video recorded yet.</p>
          )}
        </div>

        {isRecording && (
          <div className="mt-4 text-center text-gray-700 font-bold">
            Duration: {duration} sec
          </div>
        )}

        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={() => navigate("/completeFeedback")}
            className="px-8 py-3 bg-[#5B67CA] text-white rounded-md hover:bg-[#4a54b1] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isRecording || (!videoURL && !selectedFile)}
            title={
              isRecording
                ? "Stop recording before submitting"
                : "Submit your video"
            }
          >
            Submit
          </button>

          {(videoURL || selectedFile) && !isRecording && (
            <button
              onClick={handleRetake}
              className="px-8 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Retake
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
