import React, { useState, useRef } from "react";
import { Mic, Video, CheckCircle2, XCircle } from "lucide-react";
import Sidebar from "./reusable/Sidebar";

const exerciseData = [
  { id: 1, type: "speech", question: "Introduce yourself with enthusiasm." },
  { id: 2, type: "speech", question: "Explain a topic clearly in 1 minute." },
  { id: 3, type: "speech", question: "Describe your favorite hobby with varied tone." },
  { id: 4, type: "body", question: "Practice maintaining eye contact while answering." },
  { id: 5, type: "body", question: "Use natural hand gestures while describing a process." },
];

const ExerciseModule = () => {
  const [status, setStatus] = useState({}); // e.g., { 1: "processing", 4: "success" }
  const [submitted, setSubmitted] = useState(false);
  const [mediaStreams, setMediaStreams] = useState({}); // store streams per id

  // Use refs map to hold video refs for each body exercise
  const videoRefs = useRef({});

  // Initialize ref for each body exercise id
  exerciseData.forEach((item) => {
    if (item.type === "body" && !videoRefs.current[item.id]) {
      videoRefs.current[item.id] = React.createRef();
    }
  });

  const startRecording = async (id, type) => {
    setStatus((prev) => ({ ...prev, [id]: "processing" }));

    try {
      let stream;
      if (type === "speech") {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } else if (type === "body") {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (!stream) throw new Error("Could not get media stream");

      // Stop any existing stream for this exercise before replacing
      setMediaStreams((prev) => {
        if (prev[id]) {
          prev[id].getTracks().forEach((track) => track.stop());
        }
        return { ...prev, [id]: stream };
      });

      if (type === "body" && videoRefs.current[id] && videoRefs.current[id].current) {
        videoRefs.current[id].current.srcObject = stream;
        await videoRefs.current[id].current.play();
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setStatus((prev) => ({ ...prev, [id]: "error" }));
    }
  };

  const stopRecording = (id) => {
    if (mediaStreams[id]) {
      mediaStreams[id].getTracks().forEach((track) => track.stop());
      setMediaStreams((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setStatus((prev) => ({ ...prev, [id]: "success" }));
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar/>

      <main className="flex-grow max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-6 mt-6 mb-12">
        <h2 className="text-2xl font-bold text-center">Personalized Communication Exercises</h2>

        {exerciseData.map((item) => (
          <div key={item.id} className="bg-gray-50 p-4 rounded-xl shadow flex flex-col gap-3">
            <h3 className="font-semibold text-lg">
              {item.type === "speech" ? "Speech Task" : "Body Language Task"} {item.id}:
            </h3>
            <p>{item.question}</p>

            {item.type === "body" && (
              <video
                ref={videoRefs.current[item.id]}
                className="w-full h-64 bg-black rounded-md"
                playsInline
                muted
                autoPlay
              />
            )}

            <div className="flex gap-4">
              <button
                onClick={() => startRecording(item.id, item.type)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                {item.type === "speech" ? <Mic className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                {item.type === "speech" ? "Record Audio" : "Record Video"}
              </button>

              <button
                onClick={() => stopRecording(item.id)}
                disabled={!mediaStreams[item.id]}
                className={`mt-0 px-4 py-2 rounded-lg text-white ${
                  mediaStreams[item.id] ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Stop Recording
              </button>
            </div>

            {status[item.id] === "success" && (
              <div className="text-green-600 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Good job! Your response has been recorded.
              </div>
            )}

            {status[item.id] === "processing" && (
              <div className="text-blue-600 flex items-center gap-2 font-medium">Recording in progress...</div>
            )}

            {status[item.id] === "error" && (
              <div className="text-red-600 flex items-center gap-2 font-medium">
                <XCircle className="w-5 h-5" />
                Error accessing media devices. Please check permissions.
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Submit
          </button>
        </div>

        {submitted && (
          <div className="text-center mt-6 text-lg font-semibold text-blue-700">
            Your exercise responses have been submitted for review!
          </div>
        )}
      </main>
    </div>
  );
};

export default ExerciseModule;
