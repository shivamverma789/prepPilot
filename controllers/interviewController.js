// 🔥 Temporary in-memory storage (for now)
let interviewConfig = {
    role: "java developer",
    level: "beginner",
    company: "product",
    type: "technical",
    duration: "medium",
    focus: []
};

// ======================================================
// 📤 GET INTERVIEW DATA
// ======================================================
exports.getInterviewData = (req, res) => {
    res.json(interviewConfig);
};

// ======================================================
// 📥 SET INTERVIEW DATA
// ======================================================
exports.setInterviewData = (req, res) => {
    try {

        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const { role, level, company, type, duration, focus } = req.body;

        interviewConfig = {
            role: role || "java developer",
            level: level || "beginner",
            company: company || "product",
            type: type || "technical",
            duration: duration || "medium",
            focus: Array.isArray(focus) ? focus : []
        };

        res.json({
            message: "Interview config updated",
            data: interviewConfig
        });

    } catch (err) {
        console.error("Interview Config Error:", err);
        res.status(500).json({ error: "Failed to update interview config" });
    }
};

exports.saveInterviewSummary = async (req, res) => {
    try {

        const {
            job_id,
            room_id,
            summary,
            started_at,
            ended_at
        } = req.body;

        console.log("Interview Summary Received:", summary);

        // TODO: save in DB later
        // await InterviewSummary.create({...})

        res.json({ message: "Summary saved" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save summary" });
    }
};