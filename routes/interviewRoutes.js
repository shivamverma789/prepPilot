const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");

router.get("/interview-data", interviewController.getInterviewData);

router.get("/setup", (req, res) => {
    res.render("interview/setup", {
        liveKitUrl: process.env.LIVEKIT_APP_URL || "http://localhost:4000",
        serverUrl: process.env.SERVER_URL || ""
    });
});

router.post("/set-interview-data", interviewController.setInterviewData);

// router.post("/interview-summary", interviewController.saveInterviewSummary);

module.exports = router;