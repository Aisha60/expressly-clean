// import TextResult from "../models/TextResult.js";
// import VideoResult from "../models/VideoResult.js";
// import { generateTaskFromFeedback } from "../utils/taskGenerator.js";

// export const generatePracticeTask = async (req, res) => {
//     try {
//         const { userId, moduleType } = req.body;
//         if (!userId || !moduleType) {
//             return res.status(400).json({ error: "Missing userId or moduleType" });
//         }

//         // Fetch the latest assessment feedback
//         let latestResult;
//         if (moduleType === "written") {
//             latestResult = await TextResult.findOne({ userId })
//                 .sort({ createdAt: -1 })
//                 .lean();

//         } else if (moduleType === "bodylanguage") {
//             latestResult = await VideoResult.findOne({ userId })
//                 .sort({ createdAt: -1 })
//                 .lean();

//         } else if (moduleType === "speech") {
//             latestResult = {}; // Placeholder for speech module

//         } else {
//             return res.status(400).json({ error: "Invalid module type" });
//         }

//         if (!latestResult) {
//             return res.status(404).json({ error: "No analysis found for this module" });
//         }
//         console.log("latest Assessment results are fetched:", latestResult)
//         // Extract relevant info for task generation
//         const extractedData = extractFeedbackData(latestResult, moduleType);

//         // Generate tailored task
//         const task = await generateTaskFromFeedback(extractedData);

//         res.json(task);
//     } catch (error) {
//         console.error("Generate practice task error:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

// // Helper to extract weaknesses, scores, improvement tips
// const extractFeedbackData = (result, moduleType) => {
//     const data = { moduleType, weaknesses: [], improvementAreas: [], scores: {} };

//     if (moduleType === "written") {
//         const categories = result.analysisResults?.categories || {};
//         for (const [cat, details] of Object.entries(categories)) {
//             if (details.weaknesses?.length) data.weaknesses.push(...details.weaknesses);
//             if (details.improvement_tips?.length) data.improvementAreas.push(...details.improvement_tips);
//             data.scores[cat] = details.score ?? null;
//         }
//     } else if (moduleType === "bodylanguage") {
//         ["expressions", "gestures", "posture"].forEach((part) => {
//             if (result[part]?.feedback?.length) data.weaknesses.push(...result[part].feedback);
//             data.scores[part] = result[part]?.score ?? null;
//         });
//     }

//     return data;
// };


// controllers/practiceController.js
import TextResult from "../models/TextResult.js";
import VideoResult from "../models/VideoResult.js";
import { generateTaskFromFeedback } from "../utils/taskGenerator.js";

export const generatePracticeTask = async (req, res) => {
    try {
        const { userId, moduleType } = req.body;
        console.log("Received request:", { userId, moduleType });
        
        if (!userId || !moduleType) {
            return res.status(400).json({ 
                success: false,
                error: "Missing userId or moduleType" 
            });
        }

        // Fetch the latest assessment feedback
        let latestResult;
        if (moduleType === "written") {
            latestResult = await TextResult.findOne({ userId })
                .sort({ createdAt: -1 })
                .lean();
            console.log("Written result found:", !!latestResult);

        } else if (moduleType === "bodylanguage") {
            latestResult = await VideoResult.findOne({ userId })
                .sort({ createdAt: -1 })
                .lean();
            console.log("Body language result found:", !!latestResult);

        } else if (moduleType === "speech") {
            latestResult = {}; // Placeholder for speech module

        } else {
            return res.status(400).json({ 
                success: false,
                error: "Invalid module type" 
            });
        }

        if (!latestResult) {
            console.log("No assessment found for user:", userId);
            return res.status(404).json({ 
                success: false,
                error: "No analysis found for this module. Please complete an assessment first." 
            });
        }
        
        console.log("Latest Assessment results:", latestResult);

        // Extract relevant info for task generation
        const extractedData = extractFeedbackData(latestResult, moduleType);
        console.log("Extracted data for task generation:", extractedData);

        // Generate tailored task
        const task = await generateTaskFromFeedback(extractedData);
        console.log("Generated task:", task);

        res.json({
            success: true,
            task: task,
            message: "Practice task generated successfully"
        });
        
    } catch (error) {
        console.error("Generate practice task error:", error);
        res.status(500).json({ 
            success: false,
            error: "Internal server error: " + error.message 
        });
    }
};

// Helper to extract weaknesses, scores, improvement tips
const extractFeedbackData = (result, moduleType) => {
    const data = { moduleType, weaknesses: [], improvementAreas: [], scores: {} };

    if (moduleType === "written") {
        const categories = result.analysisResults?.categories || {};
        console.log("Written categories:", Object.keys(categories));
        
        for (const [cat, details] of Object.entries(categories)) {
            if (details.weaknesses?.length) {
                data.weaknesses.push(...details.weaknesses);
            }
            if (details.improvement_tips?.length) {
                data.improvementAreas.push(...details.improvement_tips);
            }
            data.scores[cat] = details.score ?? null;
        }
    } else if (moduleType === "bodylanguage") {
        console.log("Body language parts:", ["expressions", "gestures", "posture"]);
        
        ["expressions", "gestures", "posture"].forEach((part) => {
            if (result[part]?.feedback?.length) {
                data.weaknesses.push(...result[part].feedback);
            }
            data.scores[part] = result[part]?.score ?? null;
        });
    }

    console.log("Final extracted data:", data);
    return data;
};