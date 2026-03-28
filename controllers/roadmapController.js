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

        // 🚨 GUARD: If roadmap exists and not forced → DO NOT regenerate
        if (roadmap && !force) {
            return res.redirect("/roadmap");
        }

        // 🔥 If force = true → delete old data safely
        if (roadmap && force) {
            await Task.deleteMany({ roadmapId: roadmap._id });
        }

        // If no roadmap → create
        if (!roadmap) {
            roadmap = await Roadmap.create({
                userId,
                goal: req.user.goal?.join(", ") || ""
            });
        }

        // 🔥 Generate AI roadmap
        const aiPhases = await roadmapAI.generatePersonalizedRoadmap(req.user);

        if (!aiPhases || aiPhases.length === 0) {
            console.log("AI failed, keeping old roadmap intact");
            return res.redirect("/roadmap");
        }

        let orderCounter = 1;
        const tasksToInsert = [];

        aiPhases.forEach((phaseObj) => {
            const phaseName = phaseObj.phase || "General Phase";

            if (!phaseObj.skills || !Array.isArray(phaseObj.skills)) return;

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
                    title: skill.title,
                    subtopics: formattedSubtopics,
                    miniProject: miniProjectObject,
                    order: orderCounter++,
                    progressPercentage: 0,
                    phaseStatus: "pending"
                });
            });
        });

        await Task.insertMany(tasksToInsert);

        roadmap.totalPhases = aiPhases.length;
        roadmap.status = "not-started";
        roadmap.overallProgress = 0;
        await roadmap.save();

        res.redirect("/roadmap");

    } catch (err) {
        console.error("Generate Roadmap Error:", err);
        res.status(500).render("error", { message: process.env.NODE_ENV !== "production" ? err.message : null });
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
