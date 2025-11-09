import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import SpeechResult from "../models/SpeechResult.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefer environment variable for service URL, fallback to localhost:5001
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5001";

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file uploaded" });
        }

        const { userId } = req.body;

        // Validate user information
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: "User information required",
                message: "userId is required" 
            });
        }

        const filePath = req.file.path;
        const outputPath = path.join(__dirname, "../temp", `cleaned_${req.file.filename}`);

        console.log("📤 Sending audio to Python Core (unified service) for processing...");
        console.log("   Service URL:", PYTHON_SERVICE_URL);
        console.log("   Input file:", filePath);
        console.log("   Output file:", outputPath);

        // Forward to Python Core unified service - speech analysis endpoint
        const pythonResponse = await axios.post(`${PYTHON_SERVICE_URL}/speech/process-audio`, {
            filePath: filePath,
            outputPath: outputPath
        }, {
            // Whisper on CPU can be slow; allow up to 5 minutes by default
            timeout: Number(process.env.PYTHON_SERVICE_TIMEOUT_MS || 300000)
        });

        console.log("✅ Received analysis from Python Core");

        // Save speech analysis results to database
        const speechResult = new SpeechResult({
            userId: userId,
            fileName: req.file.originalname,
            recordingInfo: pythonResponse.data.recordingInfo,
            transcription: pythonResponse.data.transcription,
            pronunciation: pythonResponse.data.pronunciation,
            fluency: pythonResponse.data.fluency,
            pitch: pythonResponse.data.pitch,
            toneAnalysis: pythonResponse.data.toneAnalysis,
            scoring: pythonResponse.data.scoring,
            summary: pythonResponse.data.summary
        });

        await speechResult.save();
        console.log("✅ Speech analysis saved to database with ID:", speechResult._id);

        // Return the complete response with database ID
        return res.json({
            ...pythonResponse.data,
            resultId: speechResult._id,
            success: true
        });

    } catch (error) {
        console.error("❌ Upload error:", error.message);
        console.error("Error code:", error.code);
        console.error("Error details:", error.response?.status, error.response?.data);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: "Python service unavailable",
                message: "The audio analysis service is not running. Please start Python_Core on port 5001."
            });
        }

        if (error.response?.data) {
            return res.status(error.response.status || 500).json({
                error: error.response.data?.detail || error.response.data?.error || "Upstream error",
                upstream: error.response.data,
            });
        }

        return res.status(500).json({ 
            error: "Audio processing failed",
            message: error.message 
        });
    }
};