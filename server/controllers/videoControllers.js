
import axios from "axios";
import VideoResult from "../models/VideoResult.js";
import fs from "fs";

export const handleVideoUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded", message: "Please select a video file to upload." });
    }
    
    try {
        const filename = req.file.filename;
        const { userId} = req.body;

        // Validate user information
        if (!userId) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                error: "User information required",
                message: "userId is required" 
            });
        }

        // Call FastAPI analyzer (unified Python Core service)
        const fastApiRes = await axios.post("http://localhost:5001/analyze", {
            filename,
        });

        const { analysis, error, suggestion, meta} = fastApiRes.data;
        console.log("Analysis structure:", {
            hasAnalysis: !!analysis,
            hasOverall: !!analysis?.overall,
            overallScore: analysis?.overall?.average_score,
            error: error
        });

        // CASE 1: FastAPI validation failed (analysis is null with error)
        if (analysis === null && error) {
            fs.unlinkSync(req.file.path);
            console.log("Validation error from FastAPI:", error);
            return res.status(400).json({
                success: false,
                error: "Video Analysis Failed",
                message: error,
                suggestion: suggestion,
                type: "validation_error"
            });
        }

        // CASE 2: Check if we have at least one valid score (partial or full analysis)
        const hasValidScores = analysis && (
            analysis.posture?.score !== null ||
            analysis.gestures?.score !== null || 
            analysis.expressions?.score !== null ||
            analysis.overall?.average_score !== null
        );
        console.log("scores:", analysis.posture?.score, analysis.gestures?.score, analysis.expressions?.score, analysis.overall?.average_score);
        if (!hasValidScores) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                error: "Insufficient Data",
                message: "Could not analyze any body language components from the video.",
                suggestion: "Please ensure your face, upper body, and hands are clearly visible.",
                type: "insufficient_data"
            });
        }

        // Determine analysis status
        let status = "partial";
        if (analysis.posture?.score !== null && 
            analysis.gestures?.score !== null && 
            analysis.expressions?.score !== null) {
            status = "full";
        }

        // Save to database
        const result = new VideoResult({
            userId: userId,
            overall: {
                score: analysis.overall?.average_score ?? null,
                feedback: {
                    Strengths: analysis.overall?.feedback?.Strengths || [],
                    Weaknesses: analysis.overall?.feedback?.Weaknesses || [],
                    SummaryOfTips: analysis.overall?.feedback?.["Summary of Tips"] || [],
                },
            },
            expressions: {
                score: analysis.expressions?.score ?? null,
                feedback: analysis.expressions?.feedback || analysis.expressions?.message || [],
                reason: analysis.expressions?.reason || null,
            },
            gestures: {
                score: analysis.gestures?.score ?? null,
                feedback: analysis.gestures?.feedback || analysis.gestures?.message || [],
                reason: analysis.gestures?.reason || null,
            },
            posture: {
                score: analysis.posture?.score ?? null,
                feedback: analysis.posture?.feedback || analysis.posture?.message || [],
                reason: analysis.posture?.reason || null,
            },
            status: status,
        });

        await result.save();

        // Delete video file after successful processing
        fs.unlinkSync(req.file.path);
        console.log("meta data is", meta);
        // SUCCESS RESPONSE - only for full or partial analysis
        res.json({
            success: true,
            status: status,
            timestamp: new Date(),
            message: status === "full" 
                ? "Complete analysis completed successfully" 
                : "Partial analysis completed successfully",
            result: result
        });

    } catch (error) {
        console.error("Error in video analysis pipeline:", error.message);

        // Always delete the file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Handle different error types
        let statusCode = 500; 
        let errorMessage = "Analysis failed";
        
        if (error.response) {
            // FastAPI returned an error status code
            statusCode = error.response.status;
            errorMessage = error.response.data.detail?.error || error.response.data.error || "Analysis service error";
        } else if (error.request) {
            // No response from FastAPI
            errorMessage = "Analysis service unavailable";
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            message: error.message,
            type: "server_error"
        });
    }
};