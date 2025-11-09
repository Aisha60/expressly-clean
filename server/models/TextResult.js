import mongoose from 'mongoose';

const Text_Result_Schema = new mongoose.Schema({
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
    textMetadata: {
        wordCount: Number,
        characterCount: Number,
        source: String
    },
    analysisResults: {
        overall_score: Number,
        quality_label: String,
        categories: {
            grammar_spelling: {
                score: Number,
                level: String,
                total_errors: Number,
                detailed_errors: [{
                    message: String,
                    context: String,
                    offset: Number,
                    length: Number,
                    category: String,
                    suggestions: [String]
                }],
                weaknesses: [String],
                improvement_tips: [String],
                quality_feedback: String
            },
            readability: {
                score: Number,
                level: String,
                details: {
                    level: String,
                    target_audience: String,
                    reading_ease: String
                },
                improvement_tips: [String]
            },
            structure: {
                score: Number,
                level: String,
                details: {
                    sentence_variety: String,
                    avg_sentence_length: Number,
                    word_count: Number
                },
                improvement_tips: [String]
            },
            coherence: {
                score: Number,
                level: String,
                details: {
                    fluency: String,
                    transition_words: Number
                },
                weaknesses: [String],
                improvement_tips: [String]
            }
        }
    },
    suggestions: [String],
    key_improvement_areas: [String],
}, {
    timestamps: true 
});

// Index for faster queries by user and date
Text_Result_Schema.index({ userId: 1, timestamp: -1 });
Text_Result_Schema.index({ timestamp: -1 });

const AnalysisResult = mongoose.model('TextResult', Text_Result_Schema);

export default AnalysisResult;