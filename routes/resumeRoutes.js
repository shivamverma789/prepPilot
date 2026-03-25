// resumeRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const resumeController = require("../controllers/resumeController");

const upload = multer();

router.get("/", resumeController.getResumePage);
router.post("/analyze", upload.single("resume"), resumeController.analyzeResume);



module.exports = router;