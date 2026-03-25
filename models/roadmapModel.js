const mongoose = require("mongoose");

const roadmapSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true // One roadmap per user
    },

    title: {
        type: String,
        default: "Personalized Learning Roadmap"
    },

    goal: {
        type: String,
        default: ""
    },

    totalPhases: {
        type: Number,
        default: 0
    },

    overallProgress: {
        type: Number,
        default: 0 // % across all phases
    },

    status: {
        type: String,
        enum: ["not-started", "in-progress", "completed"],
        default: "not-started"
    }

}, { timestamps: true });

module.exports = mongoose.model("Roadmap", roadmapSchema);
