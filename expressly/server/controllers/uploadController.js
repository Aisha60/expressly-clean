import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const tempFilePath = path.join(__dirname, "../temp", req.file.filename);
  const finalFilePath = path.join(
    __dirname,
    "../uploads",
    "cleaned_" + req.file.filename
  );

  try {
    const response = await fetch("http://127.0.0.1:5001/process-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filePath: tempFilePath,
        outputPath: finalFilePath,
      }),
    });

    const data = await response.json();

    // Remove temp file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    if (!response.ok) {
      return res.status(500).json({ error: data.error || "Processing failed" });
    }

    // ✅ Forward ALL analysis results to frontend, including summary + recordingInfo
    return res.status(200).json({
      message: data.message,
      cleanedFilePath: data.filePath,
      transcription: data.transcription,
      pronunciation: data.pronunciation,
      fluency: data.fluency,
      pitch: data.pitch,
      toneAnalysis: data.toneAnalysis,
      scoring: data.scoring,
      summary: data.summary,            // ✅ added
      recordingInfo: data.recordingInfo // ✅ added
    });
  } catch (err) {
    console.error("Upload controller error:", err);
    return res
      .status(500)
      .json({ error: "Noise reduction or feature extraction failed" });
  }
};



// Gemini API endpoint and key (move key to env for production)
// const GEMINI_API_KEY = "AIzaSyCMpgu6UlX0MKlGQO5VY4SpZ8BLSGR2LRE";
// const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// export const generateQuestions = async (req, res) => {
//   try {
//     const { exerciseType, topic, difficulty } = req.body;
//     // Build prompt based on user preferences
//     let prompt = `Generate 10 practice ${exerciseType} exercises for a user.`;
//     if (topic) prompt += ` Topic: ${topic}.`;
//     if (difficulty) prompt += ` Difficulty: ${difficulty}.`;
//     prompt += " Number them 1 to 10.";

//     const response = await fetch(GEMINI_ENDPOINT, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${GEMINI_API_KEY}`,
//       },
//       body: JSON.stringify({
//         prompt,
//         temperature: 0.7,
//         maxOutputTokens: 500,
//       }),
//     });
//     const data = await response.json();
//     let text = data?.candidates?.[0]?.content || "";
//     // Split reliably by numbered list
//     const qList = text.split(/\d+\.\s+/).filter((q) => q.trim()).slice(0, 10);
//     if (qList.length === 0) {
//       return res.json({
//         questions: [
//           "Say the word 'hello' clearly.",
//           "Pronounce 'technology' with correct stress.",
//           "Speak the sentence 'I love programming' fluently.",
//           "Say 'Good morning' with proper tone.",
//           "Read 'The quick brown fox jumps over the lazy dog.'",
//           "Pronounce 'beautiful' correctly.",
//           "Say 'Can you help me?' with proper pitch variation.",
//           "Speak 'Expressly is a great app!' fluently.",
//           "Read 'Learning never stops' clearly.",
//           "Pronounce 'communication' with correct stress.",
//         ],
//       });
//     }
//     return res.json({ questions: qList });
//   } catch (err) {
//     console.error("Gemini API error:", err);
//     return res.status(500).json({ error: "Failed to generate questions." });
//   }
// };