const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");

// Toggle subtopic checkbox
router.patch("/toggle-subtopic/:taskId/:subtopicId", progressController.toggleSubtopic);

// Start mini project
router.patch("/start-project/:taskId", progressController.startProject);

// Complete mini project
router.patch("/complete-project/:taskId", progressController.completeProject);

module.exports = router;
