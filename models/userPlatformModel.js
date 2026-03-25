const mongoose = require("mongoose");

const userPlatformSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    leetcodeUsername: {
        type: String,
        default: ""
    },
    githubUsername: {
        type: String,
        default: ""
    },
    codeforcesHandle: {
    type: String,
    default: ""
    },
    hackerrankUsername: {
    type: String,
    default: ""
    },

    hackerrankSolved: {
        type: Number,
        default: 0
    },
    leetcodeSolved: {
    type: Number,
    default: 0
    },
    codeforcesRating: { type: Number, default: 0 },
    codeforcesMaxRating: { type: Number, default: 0 },
    codeforcesRank: { type: String, default: "unrated" },

    codechefUsername: {
    type: String,
    default: ""
},

codechefRating: {
    type: Number,
    default: 0
},

codechefMaxRating: {
    type: Number,
    default: 0
},

codechefGlobalRank: {
    type: Number,
    default: 0
},

codechefSolved: {
    type: Number,
    default: 0
},

codechefLastSynced: {
    type: Date
},
codechefBadges: {
    type: [String],
    default: []
}

}, { timestamps: true });

module.exports = mongoose.model("UserPlatform", userPlatformSchema);