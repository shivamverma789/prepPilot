const express = require("express");
const router = express.Router();
const roadmapController = require("../controllers/roadmapController");
const profileCheck = require("../middlewares/profileCheck");


router.get("/roadmap", roadmapController.getRoadmap);
router.post("/generate-roadmap", roadmapController.generateRoadmap);

module.exports = router;
