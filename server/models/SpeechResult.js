import mongoose from 'mongoose';

const Speech_Result_Schema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    fileName: {
        type: String,
        default: null
    },
    recordingInfo: {
        date: String,
        time: String,
        duration: String
    },
    transcription: {
        text: String,
        segments: [{
            id: Number,
            seek: Number,
            start: Number,
            end: Number,
            text: String,
            tokens: [Number],
            temperature: Number,
            avg_logprob: Number,
            compression_ratio: Number,
            no_speech_prob: Number
        }],
        language: String
    },
    pronunciation: {
        score_percent: Number,
        total_words: Number,
        correct_words: Number,
        mispronounced_words: Number,
        details: [{
            word: String,
            status: String,
            reason: String
        }],
        feedback: String
    },
    fluency: {
        fluency_score: Number,
        wpm: Number,
        pauses_detected: Number,
        avg_pause_duration: Number,
        max_pause_duration: Number,
        filler_words_count: Number,
        filler_words: [String],
        feedback: String
    },
    pitch: {
        overall: {
            mean_pitch_hz: Number,
            pitch_range_hz: Number,
            total_chunks: Number,
            monotone_chunks: Number,
            varied_chunks: Number,
            monotone_ratio: Number
        },
        per_chunk: [{
            chunk_index: Number,
            time_range: String,
            mean_pitch_hz: Number,
            std_pitch_hz: Number,
            pitch_range_hz: Number,
            is_monotone: Boolean
        }],
        feedback: String,
        recommendation: String
    },
    toneAnalysis: {
        overallContext: String,
        overallEmotion: String,
        evaluation: {
            score: Number,
            is_appropriate: Boolean,
            analysis: String,
            recommendations: [String]
        }
    },
    scoring: {
        scores: {
            pronunciation: Number,
            fluency: Number,
            pitch: Number,
            tone: Number
        },
        overallScore: Number
    },
    summary: {
        strengths: [String],
        weaknesses: [String],
        recommendations: [String]
    }
}, {
    timestamps: true
});

// Indexes for faster queries
Speech_Result_Schema.index({ userId: 1, timestamp: -1 });
Speech_Result_Schema.index({ timestamp: -1 });

const SpeechResult = mongoose.model('SpeechResult', Speech_Result_Schema);

export default SpeechResult;
