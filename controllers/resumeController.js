//resumeController.js
const { PDFParse } = require('pdf-parse');
const ResumeAnalysis = require("../models/resumeAnalysisModel");
const resumeAI = require("../services/ai/resumeAI");

exports.getResumePage = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    res.render("resume/index");
};


exports.analyzeResume = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        if (!req.file) {
            return res.send("Please upload a PDF file.");
        }

        const parser = new PDFParse({ data: req.file.buffer });
        const result = await parser.getText();
        const resumeText = result.text;

        const jobDescription = req.body.jobDescription?.trim();

        let analysis;

        if (jobDescription) {
            // 🔥 JD-Aware Analysis
            analysis = await resumeAI.analyzeWithJD(resumeText, jobDescription);
        } else {
            // 🔥 Normal ATS Analysis
            analysis = await resumeAI.analyze(resumeText);
        }

        await ResumeAnalysis.create({
            userId: req.user._id,
            atsScore: analysis.atsScore,
            breakdown: analysis.breakdown,
            criticalIssues: analysis.criticalIssues,
            missingKeywords: analysis.missingKeywords,
            improvementSuggestions: analysis.improvementSuggestions,
            rewriteExamples: analysis.rewriteExamples,
            resumeText
        });

        res.render("resume/result", { analysis });

    } catch (err) {
        console.error("Resume Error:", err);
        res.send("Error analyzing resume.");
    }
};