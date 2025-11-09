import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const generateTaskFromFeedback = async (data) => {
    const { moduleType, weaknesses = [], improvementAreas = [], scores = {} } = data;

    let prompt = "";

    if (moduleType === "written") {
        prompt = `
You are an AI tutor generating a practice task for improving a user's writing skills.
Weaknesses: ${weaknesses.join(", ")}
Improvement Areas: ${improvementAreas.join(", ")}
Scores: ${JSON.stringify(scores)}

Generate a JSON object with:
{
  "FocusArea": "rewrite_with_better_sentence_structure | grammar_spelling_fix | sentence_expansion_for_better_coherence",
  "task_title": "short descriptive title",
  "task_instruction": "clear step by step instructions for the user",
  "task_content": "at least 50 words paragraph or text snippet for practice",
  "additional_notes": "optional tips"
}

The task must directly address the user's weaknesses and be practical. Output only valid JSON.
`;
    } else if (moduleType === "bodylanguage") {
        prompt = `
You are an AI coach generating a body language practice task.
Weaknesses: ${weaknesses.join(", ")}
Scores: ${JSON.stringify(scores)}

Generate a JSON object with:
{
  "FocusArea": "gesture_usefulness,controlled_gestures | posture_correction | expression_training",
  "task_title": "short descriptive title",
  "task_instruction": "instructions for the user to perform the task",
  "task_content": "recording setup or example video instructions",
  "additional_notes": "optional tips"
}

The task must be specific, actionable, and focused on improving the identified weaknesses. Output only valid JSON.
`;
    }

    try {
        // API call
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            // contents: [{ role: "user", parts: [{ text: prompt }] }],
            contents: prompt,
        });

        const text = response.text || "{}";
        console.log("Raw Gemini response:", text);

        let task;
        try {
            const cleanText = text.replace(/```json|```/g, '').trim();
            task = JSON.parse(cleanText);
        } catch (err) {
            console.error("Failed to parse Gemini JSON:", err);
            task = generateFallbackTask(moduleType, weaknesses);
        }

        return task;
    } catch (error) {
        console.error("Gemini API failed:", error);
        return generateFallbackTask(moduleType, weaknesses);
    }
};

function generateFallbackTask(moduleType, weaknesses = []) {
    if (moduleType === "written") {
        return {
            task_title: "Writing Improvement Practice",
            task_instruction: "Rewrite the following text focusing on improving clarity, grammar, and structure.",
            task_content: "Effective communication is essential in professional environments. It involves expressing ideas clearly, organizing thoughts logically, and using appropriate language for the audience. Good writing skills can significantly impact career success and professional relationships.",
            additional_notes: "Focus on sentence structure, grammar, and coherence. Aim for at least 100 words in your rewrite.",
            FocusArea: "general"
        };
    } else {
        return {
            task_title: "Body Language Practice",
            task_content: "Improve your non-verbal communication skills",
            task_instruction: "Record a 30-second video introducing yourself. Focus on maintaining good posture, clear gestures, and natural facial expressions. Ensure your upper body and hands are visible throughout the recording.",
            additional_notes: "Minimum 10 seconds video recording with clear visibility, Confident and engaged posture, Upper body and hands visible in frame, Natural and purposeful gestures ",
            FocusArea: "general"
        };
    }
}
