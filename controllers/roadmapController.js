const Roadmap = require("../models/roadmapModel");
const Task = require("../models/taskModel");
const roadmapAI = require("../services/ai/roadmapAI");


exports.generateRoadmap = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const userId = req.user._id;
        const force = req.query.force === "true";

        let roadmap = await Roadmap.findOne({ userId });

        // ✅ Check if roadmap has actual tasks
        let existingTasksCount = 0;
        if (roadmap) {
            existingTasksCount = await Task.countDocuments({ roadmapId: roadmap._id });
        }

        // 🚫 Skip regeneration if roadmap exists AND has tasks AND not forced
        if (roadmap && existingTasksCount > 0 && !force) {
            return res.redirect("/roadmap");
        }

        // 🔥 STEP 1: Generate AI roadmap FIRST (DO NOT DELETE BEFORE THIS)
        const aiPhases = await roadmapAI.generatePersonalizedRoadmap(req.user);

        if (!aiPhases || aiPhases.length === 0) {
            console.log("❌ AI failed, keeping existing roadmap intact");

            return res.status(500).render("error", {
                message: "Failed to generate roadmap. "
            });
        }

        // 🔥 STEP 2: Now safe to delete old data
        if (roadmap && force) {
            await Task.deleteMany({ roadmapId: roadmap._id });
            await Roadmap.deleteOne({ _id: roadmap._id });
            roadmap = null;
        }

        // 🔥 STEP 3: Create fresh roadmap
        if (!roadmap) {
            roadmap = await Roadmap.create({
                userId,
                goal: req.user.goal?.join(", ") || ""
            });
        }

        // 🔥 STEP 4: Transform AI → DB format
        let orderCounter = 1;
        const tasksToInsert = [];

        aiPhases.forEach((phaseObj) => {
            const phaseName = phaseObj.phase || "General Phase";

            if (!Array.isArray(phaseObj.skills)) return;

            phaseObj.skills.forEach((skill) => {

                const formattedSubtopics = (skill.subtopics || []).map(sub => {
                    if (typeof sub === "string") {
                        return {
                            title: sub,
                            isCompleted: false,
                            resources: []
                        };
                    }

                    return {
                        title: sub.title || "Untitled Subtopic",
                        isCompleted: false,
                        resources: (sub.resources || []).map(r => ({
                            title: r.title || "Resource",
                            url: r.url || "",
                            type: r.type || "resource"
                        }))
                    };
                });

                let miniProjectObject = {
                    title: "",
                    description: "",
                    isStarted: false,
                    isCompleted: false
                };

                if (typeof skill.miniProject === "string") {
                    miniProjectObject.title = skill.miniProject;
                    miniProjectObject.description = skill.miniProject;
                } else if (typeof skill.miniProject === "object" && skill.miniProject !== null) {
                    miniProjectObject.title = skill.miniProject.title || "";
                    miniProjectObject.description = skill.miniProject.description || "";
                }

                tasksToInsert.push({
                    roadmapId: roadmap._id,
                    phase: phaseName,
                    title: skill.title || "Untitled Skill",
                    subtopics: formattedSubtopics,
                    miniProject: miniProjectObject,
                    order: orderCounter++,
                    progressPercentage: 0,
                    phaseStatus: "pending"
                });
            });
        });

        // 🚨 Safety check
        if (tasksToInsert.length === 0) {
            console.log("❌ No tasks generated from AI");

            return res.status(500).render("error", {
                message: "AI generated invalid roadmap. Try again."
            });
        }

        // 🔥 STEP 5: Insert tasks
        await Task.insertMany(tasksToInsert);

        // 🔥 STEP 6: Update roadmap meta
        roadmap.totalPhases = aiPhases.length;
        roadmap.status = "not-started";
        roadmap.overallProgress = 0;
        await roadmap.save();

        // ✅ DONE
        return res.redirect("/roadmap");

    } catch (err) {
        console.error("Generate Roadmap Error:", err);

        return res.status(500).render("error", {
            message: process.env.NODE_ENV !== "production" ? err.message : "Something went wrong"
        });
    }
};

exports.getRoadmap = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const roadmap = await Roadmap.findOne({ userId: req.user._id });

        if (!roadmap) {
            return res.render("dashboard/roadmap", {
                tasks: []
            });
        }

        const tasks = await Task.find({ roadmapId: roadmap._id });

        res.render("dashboard/roadmap", {
            tasks
        });

    } catch (err) {
        console.error("Load Roadmap Error:", err);
        res.status(500).render("error", { message: process.env.NODE_ENV !== "production" ? err.message : null });
    }
};
