const User = require("../models/userModel");
const UserPlatform = require("../models/userPlatformModel");

// 🔹 GET /profile
exports.getProfile = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    res.render("dashboard/profile", {
        user: req.user,
        updated: req.query.updated
    });
};


// 🔹 POST /profile
exports.updateProfile = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const user = await User.findById(req.user._id);

        const {
            goalsJson,
            skillsJson,
            targetCompanyType,
            year,
            degree,
            branch,
            university,
            projectsCount,
            internshipExperience,
            resumeReady,
            dailyStudyHours
        } = req.body;

        // ===============================
        // 🎯 GOALS (same logic as onboarding)
        // ===============================
        let parsedGoals = [];

        if (goalsJson) {
            try {
                parsedGoals = JSON.parse(goalsJson);
            } catch (err) {
                parsedGoals = [];
            }
        }

        const careerGoalsArr = [];
        const customGoalsArr = [];

        parsedGoals.forEach(goal => {
            if (!goal?.name) return;

            const clean = goal.name.trim();
            if (!clean) return;

            if (goal.source === "custom") {
                if (!customGoalsArr.includes(clean)) {
                    customGoalsArr.push(clean);
                }
            } else {
                if (!careerGoalsArr.includes(clean)) {
                    careerGoalsArr.push(clean);
                }
            }
        });

        user.careerGoals = careerGoalsArr;
        user.customGoals = customGoalsArr;

        user.targetCompanyType = targetCompanyType || "product";

        // ===============================
        // 🎓 ACADEMIC
        // ===============================
        user.academic = {
            year: year || "",
            degree: degree || "",
            branch: branch || "",
            university: university || ""
        };

        user.year = year || "";
        user.degree = degree || "";

        // ===============================
        // 🧠 SKILLS
        // ===============================
        let parsedSkills = [];

        if (skillsJson) {
            try {
                parsedSkills = JSON.parse(skillsJson);
            } catch (e) {
                parsedSkills = [];
            }
        }

        const normalizedSkills = [];

        parsedSkills.forEach(skill => {
            if (!skill?.name) return;

            const cleanName = skill.name.trim();
            if (!cleanName) return;

            if (normalizedSkills.find(s => s.name.toLowerCase() === cleanName.toLowerCase())) return;

            normalizedSkills.push({
                name: cleanName,
                source: skill.source === "custom" ? "custom" : "core",
                level: skill.level || "beginner",
                exposure: skill.exposure || "heard",
                confidence: Math.min(Math.max(parseInt(skill.confidence) || 1, 0), 5)
            });
        });

        user.skills = normalizedSkills;

        // ===============================
        // 💼 EXPERIENCE
        // ===============================
        user.experience = {
            projectsCount: projectsCount || "0",
            internshipExperience: internshipExperience === "true",
            resumeReady: resumeReady === "true",
            dailyStudyHours: dailyStudyHours || "1-3"
        };

        await user.save();

        // 🔥 CRITICAL: Refresh session
        req.login(user, (err) => {
            if (err) {
                console.error("Session refresh error:", err);
                return res.redirect("/dashboard");
            }

            return res.redirect("/dashboard");
        });

    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).render("error", { message: process.env.NODE_ENV !== "production" ? err.message : null });
    }
};

exports.getDSAProfiles = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  const userPlatforms = await UserPlatform.findOne({
              userId: req.user._id
});
  res.render("activity/profile", {
            userPlatforms,
            
    });

}

exports.updateDSAProfiles = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      codeforces,
      leetcode,
      codechef,
      gfg,
      hackerrank,
      codingninjas,
      github
    } = req.body;

    await User.findByIdAndUpdate(userId, {
      dsaProfiles: {
        codeforces,
        leetcode,
        codechef,
        gfg,
        hackerrank,
        codingninjas,
        github
      }
    });

    res.redirect("/profile"); // or wherever your profile page is
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: process.env.NODE_ENV !== "production" ? err.message : null });
  }
};