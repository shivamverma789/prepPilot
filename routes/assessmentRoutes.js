const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");

// GET quiz for a subtopic
router.get("/assessment/:taskId/:subtopicId", assessmentController.getSubtopicAssessment);

router.post("/assessment/submit/:assessmentId", assessmentController.submitAssessment);

module.exports = router;
