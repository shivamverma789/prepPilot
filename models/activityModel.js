const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    platform: {
        type: String,
        enum: ["leetcode", "github"],
        required: true
    },
    count: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

activitySchema.index({ userId: 1, date: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model("Activity", activitySchema);