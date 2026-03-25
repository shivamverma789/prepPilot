const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

router.get("/", profileController.getProfile);
router.post("/", profileController.updateProfile);

router.get("/dsa-profiles", profileController.getDSAProfiles);
router.post("/dsa-profiles",  profileController.updateDSAProfiles);

module.exports = router;