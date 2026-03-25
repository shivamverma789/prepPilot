// resumeAnalysisModel.js
const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // ===== BASE ATS =====
    atsScore: Number,
    breakdown: {
        atsCompatibility: Number,
        keywordOptimization: Number,
        projectQuality: Number,
        experienceStrength: Number,
        structureClarity: Number,
        quantification: Number
    },
    criticalIssues: [String],
    missingKeywords: [String],
    improvementSuggestions: [String],
    rewriteExamples: [
        {
            original: String,
            improved: String
        }
    ],

    // ===== JD MATCH FIELDS (OPTIONAL) =====
    jdMatchScore: Number,
    matchedSkills: [String],
    missingSkills: [String],
    tailoringSuggestions: [String],
    jobDescriptionText: String,

    // Store resume text
    resumeText: String

}, { timestamps: true });

module.exports = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);