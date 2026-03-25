const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String,

    // 🔥 NEW (for feedback system)
    concept: {
        type: String, // e.g. "DOM Events", "Closures", "Arrays"
        required: true,
        default: "general"
    },
    difficulty: {
        type: String,
        enum: ["basic", "intermediate", "advanced"],
        default: "basic"
    },
    userAnswer: {
    type: String,
    default: ""
    },
    isCorrect: {
        type: Boolean,
        default: false
    }


}, { _id: false });


const assessmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    subtopicId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    subtopicTitle: {
        type: String,
        required: true
    },

    // 5 MCQ questions
    questions: [questionSchema],

    score: {
        type: Number,
        default: null
    },

    attempts: {
        type: Number,
        default: 0
    },
    masteryLevel: {
        type: String,
        enum: ["not-attempted","weak", "revision-needed", "mastered"],
        default: "weak"
    },
    lastAttemptedAt: Date

}, { timestamps: true });

module.exports = mongoose.model("Assessment", assessmentSchema);
