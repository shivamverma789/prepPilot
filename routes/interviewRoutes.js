const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");

router.get("/interview-data", interviewController.getInterviewData);

router.get("/setup", (req, res) => {
    res.render("interview/setup");
});

router.post("/set-interview-data", interviewController.setInterviewData);

// router.post("/interview-summary", interviewController.saveInterviewSummary);

module.exports = router;