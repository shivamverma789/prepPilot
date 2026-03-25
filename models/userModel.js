const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    source: {
        type: String,
        enum: ["core", "custom"],
        default: "core"
    },
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
    },
    exposure: {
        type: String,
        enum: ["heard", "learned", "projects", "confident"],
        default: "heard"
    },
    confidence: {
        type: Number,
        min: 0,
        max: 5,
        default: 1
    }
}, { _id: false });

const experienceSchema = new mongoose.Schema({
    projectsCount: {
        type: String,
        enum: ["0", "1-3", "3+"],
        default: "0"
    },
    internshipExperience: {
        type: Boolean,
        default: false
    },
    resumeReady: {
        type: Boolean,
        default: false
    },
    dailyStudyHours: {
        type: String,
        enum: ["<1", "1-3", "3-5", "5+"],
        default: "1-3"
    }
}, { _id: false });

const academicSchema = new mongoose.Schema({
    year: {
        type: String,
        default: ""
    },
    degree: {
        type: String,
        default: ""
    },
    branch: {
        type: String,
        default: ""
    },
    university: {
        type: String,
        default: ""
    }
}, { _id: false });

const userSchema = new mongoose.Schema({
    // 🔹 Basic Auth Fields (KEEP - Required for Passport)
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
    type: String,
    unique: true
    },
    // 🔹 Role (for future scalability: student/admin)
    role: {
        type: String,
        default: "student"
    },

    // 🔹 LEGACY FIELDS (IMPORTANT - Do NOT remove yet)
    // These keep your existing roadmap & auth logic stable
    year: {
        type: String,
        default: ""
    },
    degree: {
        type: String,
        default: ""
    },
    goal: [{
        type: String
    }],
    skillsLegacy: [{
        type: String
    }],

    // 🔥 NEW DEEP PROFILING SYSTEM (CORE USP)
    
    // 🎯 Career Targeting
    careerGoals: [{
        type: String,
        trim: true
    }],
    customGoals: [{
        type: String,
        trim: true
    }],
    targetCompanyType: {
        type: String,
        enum: ["product", "service", "startup", "faang"],
        default: "product"
    },

    // 🎓 Academic Context (PRIMARY - Future AI uses this)
    academic: academicSchema,

    // 🧠 Smart Skill Profiling (Hybrid: Core + Custom + Confidence)
    skills: [skillSchema],

    // 💼 Experience Depth (Placement Intelligence)
    experience: {
        type: experienceSchema,
        default: () => ({})
    },

    dsaProfiles: {
        codeforces: String,
        leetcode: String,
        gfg: String,
        codechef: String,
        hackerrank: String,
        codingninjas: String,
        github: String
    },

    // 📊 Profile Completion Control (VERY IMPORTANT)
    profileCompleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
