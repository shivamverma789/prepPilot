const express = require("express");
const router = express.Router();
const onboardingController = require("../controllers/onboardingController");

// Show onboarding page
router.get("/", onboardingController.getOnboarding);

// Handle final form submit
router.post("/", onboardingController.postOnboarding);

module.exports = router;
