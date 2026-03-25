const express = require("express");
const router = express.Router();

const {
    getDashboard,
    getProfilePage,
    saveProfile,
    syncLeetCode,
    syncGithub,
    syncCodeforces
} = require("../controllers/activityController");
const { syncHackerRank } = require("../controllers/activityController");
const { syncCodechef } = require("../controllers/activityController");
const { syncAllPlatforms } = require("../controllers/activityController");
const { getPublicProfile } = require("../controllers/activityController");
router.get("/resources", (req, res) => {
    res.render("activity/resources");
});

// Activity Dashboard
router.get("/activity-dashboard", getDashboard);

// Profile Setup
router.get("/activity-profile", getProfilePage);
router.post("/activity-profile", saveProfile);

router.get("/activity-sync/leetcode", syncLeetCode);
router.get("/activity-sync/github", syncGithub);
router.get("/activity-sync/codeforces", syncCodeforces);
router.get("/activity-sync/hackerrank", syncHackerRank);
router.get("/activity-sync/codechef", syncCodechef);

router.get("/activity-sync/all", syncAllPlatforms);

router.get("/u/:username", getPublicProfile);

module.exports = router;