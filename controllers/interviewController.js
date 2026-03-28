const DEFAULT_CONFIG = {
    role: "Software Engineer",
    level: "beginner",
    company: "product",
    type: "technical",
    duration: "medium",
    focus: []
};

exports.getInterviewData = (req, res) => {
    res.json(req.session.interviewConfig || DEFAULT_CONFIG);
};

exports.setInterviewData = (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const { role, level, company, type, duration, focus } = req.body;

        req.session.interviewConfig = {
            role: role || DEFAULT_CONFIG.role,
            level: level || DEFAULT_CONFIG.level,
            company: company || DEFAULT_CONFIG.company,
            type: type || DEFAULT_CONFIG.type,
            duration: duration || DEFAULT_CONFIG.duration,
            focus: Array.isArray(focus) ? focus : []
        };

        res.json({ message: "Interview config updated", data: req.session.interviewConfig });

    } catch (err) {
        console.error("Interview Config Error:", err);
        res.status(500).json({ error: "Failed to update interview config" });
    }
};

exports.saveInterviewSummary = async (req, res) => {
    try {
        // TODO: persist to DB when needed
        res.json({ message: "Summary received" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save summary" });
    }
};
