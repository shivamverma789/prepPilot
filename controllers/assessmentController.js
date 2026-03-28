const Task = require("../models/taskModel");
const Assessment = require("../models/assessmentModel");
const assessmentAI = require("../services/ai/assessmentAI");

// ======================================================
// 🎯 GET SUBTOPIC ASSESSMENT (SMART + NON-REPETITIVE)
// ======================================================
exports.getSubtopicAssessment = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const { taskId, subtopicId } = req.params;

        // 1️⃣ Fetch task & subtopic
         const task = await Task.findById(taskId);
        if (!task) return res.status(404).render("error", { message: "Task not found" });

        const subtopic = task.subtopics.id(subtopicId);
        if (!subtopic) return res.status(404).render("error", { message: "Subtopic not found" });

        // 2️⃣ Get latest assessment attempt (IMPORTANT)
        let latestAssessment = await Assessment.findOne({
            userId: req.user._id,
            subtopicId: subtopicId
        }).sort({ createdAt: -1 });

        // 3️⃣ Decide whether to regenerate quiz (SMART LOGIC)
        let shouldRegenerate = false;

        if (!latestAssessment) {
            shouldRegenerate = true;
        } else if (
            latestAssessment.masteryLevel === "weak" ||
            latestAssessment.masteryLevel === "revision-needed"
        ) {
            // Regenerate better quiz if user is weak
            shouldRegenerate = true;
        }

        let assessment;

        if (shouldRegenerate) {
            // 🎯 Adaptive user level logic
            let userLevel = "Beginner";
            if (latestAssessment && latestAssessment.masteryLevel === "mastered") {
                userLevel = "Intermediate";
            }

            // 4️⃣ Generate quiz via AI (REAL-TIME)
            const rawQuestions = await assessmentAI.generateSubtopicQuiz({
                subtopicTitle: subtopic.title,
                skillTitle: task.title,
                userLevel
            });

            // 5️⃣ Safety Transform (CRITICAL - prevents validation crashes)
            const questions = (rawQuestions || []).map((q, index) => ({
                question: q.question || `Concept question ${index + 1}`,
                options: Array.isArray(q.options) ? q.options : [],
                correctAnswer: q.correctAnswer || "",
                explanation: q.explanation || "No explanation provided",
                concept: q.concept || subtopic.title, // 🔥 REQUIRED for feedback system
                difficulty: q.difficulty || "basic"
            }));

            if (!questions || questions.length === 0) {
                return res.status(500).render("error", { message: "Failed to generate assessment questions. Please try again." });
            }

            // 6️⃣ Create NEW assessment attempt (not overwrite old)
            assessment = await Assessment.create({
                userId: req.user._id,
                taskId: taskId,
                subtopicId: subtopicId,
                subtopicTitle: subtopic.title,
                questions,
                score: 0,
                attempts: 0,
                masteryLevel: "not-attempted"
            });

        } else {
            // Reuse latest (if already mastered or fresh)
            assessment = latestAssessment;
        }

        res.render("assessment/quiz", { assessment });

    } catch (err) {
        console.error("Get Assessment Error:", err);
        res.status(500).render("error", { message: process.env.NODE_ENV !== "production" ? err.message : null });
    }
};


// ======================================================
// 📝 SUBMIT ASSESSMENT + FEEDBACK + GAP ANALYSIS (CORE USP)
// ======================================================
exports.submitAssessment = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const { assessmentId } = req.params;

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).render("error", { message: "Assessment not found" });
        }

        let score = 0;
        const conceptPerformance = {}; // 🔥 Core Feedback Engine

        // 1️⃣ Evaluate answers
        assessment.questions.forEach((q, index) => {
            const userAnswer = req.body[`q${index}`];

            // Save user answer inside DB
            q.userAnswer = userAnswer || "";

            if (!conceptPerformance[q.concept]) {
                conceptPerformance[q.concept] = {
                    total: 0,
                    correct: 0
                };
            }

            conceptPerformance[q.concept].total++;

            if (userAnswer === q.correctAnswer) {
                score++;
                q.isCorrect = true;   // 🔥 store correctness
                conceptPerformance[q.concept].correct++;
            } else {
                q.isCorrect = false;  // 🔥 store incorrect state
            }
        });


        // 2️⃣ Calculate percentage
        const percentage = (score / assessment.questions.length) * 100;

        // 3️⃣ Mastery Level Logic (SMART)
        let masteryLevel = "weak";

        if (percentage >= 80) {
            masteryLevel = "mastered";
        } else if (percentage >= 50) {
            masteryLevel = "revision-needed";
        } else {
            masteryLevel = "weak";
        }

        assessment.masteryLevel = masteryLevel;

        // 4️⃣ Weak Concept Detection (VERY IMPORTANT)
        const weakConcepts = [];
        Object.keys(conceptPerformance).forEach(concept => {
            const perf = conceptPerformance[concept];
            const accuracy = (perf.correct / perf.total) * 100;

            if (accuracy < 60) {
                weakConcepts.push({
                    concept,
                    accuracy: Math.round(accuracy)
                });
            }
        });

        // 5️⃣ Smart Feedback Generator (No AI needed = Fast + Cheap)
        let feedback = "";
        let performanceGap = "";

        if (percentage >= 80) {
            feedback = "Excellent performance. Strong conceptual clarity.";
            performanceGap = "Minor gaps only. You can safely proceed to the next subtopic.";
        } else if (percentage >= 50) {
            feedback = "Decent understanding but with noticeable conceptual gaps.";
            performanceGap = "You should revise weak concepts before marking this subtopic as completed.";
        } else {
            feedback = "Weak foundation detected in this subtopic.";
            performanceGap = "Re-learn the fundamentals and retake the assessment before progressing.";
        }

        // 6️⃣ Save Attempt Data
        assessment.score = score;
        assessment.attempts += 1;
        assessment.lastAttemptedAt = new Date();
        await assessment.save();

        // 7️⃣ Render Result Page
        res.render("assessment/result", {
            assessment,
            score,
            percentage: Math.round(percentage),
            weakConcepts,
            feedback,
            performanceGap,
            masteryLevel
        });

    } catch (err) {
        console.error("Submit Assessment Error:", err);
        res.status(500).render("error", { message: process.env.NODE_ENV !== "production" ? err.message : null });
    }
};
