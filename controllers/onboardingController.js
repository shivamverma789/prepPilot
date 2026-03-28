const User = require("../models/userModel");

// 🔹 GET /onboarding
exports.getOnboarding = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    // If already completed, skip onboarding
    if (req.user.profileCompleted) {
        return res.redirect("/dashboard");
    }

    // Core skills for selectable grid
    const coreSkills = [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Node.js",
        "MongoDB",
        "DSA",
        "OOP",
        "DBMS",
        "OS",
        "Python",
        "AWS",
        "TypeScript"
    ];

    res.render("onboarding/index", {
        coreSkills,
        user: req.user
    });
};


// 🔹 POST /onboarding (FINAL SUBMIT ONLY)
exports.postOnboarding = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const user = await User.findById(req.user._id);

        const {
            goalsJson,
            targetCompanyType,
            year,
            degree,
            branch,
            university,
             projectsCount,
            internshipExperience,
            resumeReady,
            dailyStudyHours,
            skillName,
            skillLevel,
            skillConfidence
        } = req.body;
        // 1️⃣ Career Goals (FINAL - From Autocomplete JSON)
let parsedGoals = [];

if (goalsJson && goalsJson !== "") {
    try {
        parsedGoals = JSON.parse(goalsJson);
    } catch (err) {
        // console.error("Goals JSON Parse Error:", err);
        parsedGoals = [];
    }
}

const careerGoalsArr = [];
const customGoalsArr = [];

parsedGoals.forEach(goal => {
    if (!goal || !goal.name) return;

    const cleanName = goal.name.trim();
    if (!cleanName) return;

    // Deduplicate
    if (
        careerGoalsArr.includes(cleanName) ||
        customGoalsArr.includes(cleanName)
    ) return;

    if (goal.source === "custom") {
        customGoalsArr.push(cleanName);
    } else {
        careerGoalsArr.push(cleanName);
    }
});

// 🔥 IMPORTANT: Assign to correct schema fields
user.careerGoals = careerGoalsArr;
user.customGoals = customGoalsArr;





        user.targetCompanyType = targetCompanyType || "product";

        // 2️⃣ Academic (structured + legacy sync)
        user.academic = {
            year: year || "",
            degree: degree || "",
            branch: branch || "",
            university: university || ""
        };

        // Legacy fields (IMPORTANT for your existing roadmap logic)
        user.year = year || "";
        user.degree = degree || "";

        // 3️⃣ Skills (NEW - from autocomplete skill cards)
let parsedSkills = [];

if (req.body.skillsJson) {
    try {
        parsedSkills = JSON.parse(req.body.skillsJson);
    } catch (e) {
        console.error("Skills JSON Parse Error:", e);
        parsedSkills = [];
    }
}

// 🧠 Normalize + Validate Skills (very important for unlimited skills)
const normalizedSkills = [];

parsedSkills.forEach((skill) => {
    if (!skill.name) return;

    const cleanedName = skill.name.trim();

    // Prevent empty & duplicates
    if (!cleanedName) return;
    if (normalizedSkills.find(s => s.name.toLowerCase() === cleanedName.toLowerCase())) return;

    normalizedSkills.push({
        name: cleanedName,
        source: skill.source === "custom" ? "custom" : "core",
        level: skill.level || "beginner",
        exposure: skill.exposure || "heard",
        confidence: Math.min(Math.max(parseInt(skill.confidence) || 1, 0), 5)
    });
});

user.skills = normalizedSkills;

// 4️⃣ Experience Intelligence (NEW - Step 4)
user.experience = {
    projectsCount: projectsCount || "0",
    internshipExperience: internshipExperience === "true",
    resumeReady: resumeReady === "true",
    dailyStudyHours: dailyStudyHours || "1-3"
};


        // 5 Mark onboarding complete
        user.profileCompleted = true;

        await user.save();

        // 🔥 CRITICAL: refresh session user (fixes redirect loop)
        req.login(user, (err) => {
            if (err) {
                console.error("Session Refresh Error:", err);
                return res.redirect("/dashboard");
            }
            return res.redirect("/dashboard");
        });


    } catch (err) {
        console.error("Onboarding Error:", err);
        res.status(500).render("error", { message: process.env.NODE_ENV !== "production" ? err.message : null });
    }
};
