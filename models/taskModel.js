const mongoose = require("mongoose");

// 🔹 Resource Schema (multiple links per subtopic)
const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    type: {
        type: String, // youtube, docs, article
        default: "resource"
    }
}, { _id: false });

// 🔹 Subtopic Schema (checkbox level tracking)
const subtopicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },

    // 🧠 NEW: Learning Intelligence Fields
    mastery: {
        type: String,
        enum: ["not-attempted", "weak", "revision-needed", "mastered"],
        default: "not-attempted"
    },

    lastScore: {
        type: Number,
        default: 0
    },

    attempts: {
        type: Number,
        default: 0
    },

    resources: [resourceSchema]
});


// 🔹 Mini Project Schema (milestone tracking)
const miniProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    githubLink: {
        type: String,
        default: ""
    },
    liveLink: {
        type: String,
        default: ""
    },
    isStarted: {
        type: Boolean,
        default: false
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: Date
});

// 🔹 Main Task Schema (Skill inside a Phase)
const taskSchema = new mongoose.Schema({
    roadmapId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Roadmap",
        required: true
    },

    // Example: "Phase 1: HTML Foundations"
    phase: {
        type: String,
        required: true
    },

    // Example: "Learn JavaScript Basics"
    title: {
        type: String,
        required: true
    },

    // Ordered curriculum flow
    order: {
        type: Number,
        default: 0
    },

    // Learning checklist
    subtopics: [subtopicSchema],

    // Project milestone tracking
    miniProject: miniProjectSchema,

    // Phase progress tracking
    progressPercentage: {
        type: Number,
        default: 0
    },

    phaseStatus: {
        type: String,
        enum: ["pending", "in-progress", "completed"],
        default: "pending"
    }

}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
