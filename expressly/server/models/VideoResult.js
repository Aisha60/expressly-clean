import mongoose from "mongoose";

const Video_Analysis_Schema = new mongoose.Schema({
userId: {
    type: String,
    required: true,
    },
overall: {
    score: { type: Number, default: null },
    feedback: {
    Strengths: [String],
    Weaknesses: [String],
    SummaryOfTips: [String],
    }
    },
expressions: {
    score: { type: Number, default: null },
    feedback: { type: [String]},
    reason: { type: String, default: null },
    },
gestures: {
    score: { type: Number, default: null },
    feedback: { type: [String]},
    reason: { type: String, default: null },
    },
posture: {
    score: { type: Number, default: null },
    feedback: { type: [String]},
    reason: { type: String, default: null },
    },
status: {
    type: String,
    enum: ["partial", "full"],
    default: "partial",
    },
createdAt: {
    type: Date,
    default: Date.now,
    }
});

export default mongoose.model("VideoResult", Video_Analysis_Schema);
