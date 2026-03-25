const Task = require("../models/taskModel");
const Roadmap = require("../models/roadmapModel");

// 🔥 Helper: Calculate Progress & Status
const calculateProgressAndStatus = (task) => {
    const totalSubtopics = task.subtopics.length;
    const completedSubtopics = task.subtopics.filter(s => s.isCompleted).length;

    let progress = 0;

    // 80% weight = subtopics
    if (totalSubtopics > 0) {
        progress = Math.round((completedSubtopics / totalSubtopics) * 80);
    }

    // 20% weight = mini project
    if (task.miniProject && task.miniProject.isCompleted) {
        progress += 20;
    }

    // Cap at 100
    if (progress > 100) progress = 100;

    // Status logic
    let status = "pending";
    if (progress === 0) {
        status = "pending";
    } else if (progress === 100) {
        status = "completed";
    } else {
        status = "in-progress";
    }

    return { progress, status };
};

// 🔥 Toggle Subtopic Checkbox
exports.toggleSubtopic = async (req, res) => {
    try {
        const { taskId, subtopicId } = req.params;

        const task = await Task.findById(taskId);
        if (!task) return res.redirect("/roadmap");

        const subtopic = task.subtopics.id(subtopicId);
        if (!subtopic) return res.redirect("/roadmap");

        // Toggle checkbox
        subtopic.isCompleted = !subtopic.isCompleted;

        // Recalculate progress
        const { progress, status } = calculateProgressAndStatus(task);
        task.progressPercentage = progress;
        task.phaseStatus = status;

        await task.save();

        // 🔥 Update overall roadmap progress
        await updateOverallRoadmapProgress(task.roadmapId);

        res.redirect("/roadmap");
    } catch (err) {
        console.error("Toggle Subtopic Error:", err);
        res.redirect("/roadmap");
    }
};

// 🔥 Start Mini Project
exports.startProject = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);
        if (!task) return res.redirect("/roadmap");

        task.miniProject.isStarted = true;
        await task.save();

        res.redirect("/roadmap");
    } catch (err) {
        console.error("Start Project Error:", err);
        res.redirect("/roadmap");
    }
};

// 🔥 Complete Mini Project
exports.completeProject = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);
        if (!task) return res.redirect("/roadmap");

        task.miniProject.isCompleted = true;
        task.miniProject.completedAt = new Date();

        // Recalculate progress
        const { progress, status } = calculateProgressAndStatus(task);
        task.progressPercentage = progress;
        task.phaseStatus = status;

        await task.save();

        // Update roadmap overall progress
        await updateOverallRoadmapProgress(task.roadmapId);

        res.json({ success: true });
    } catch (err) {
        console.error("Complete Project Error:", err);
        res.status(500).json({ success: false })
    }
};

// 🔥 Update Overall Roadmap Progress (GLOBAL TRACKING)
const updateOverallRoadmapProgress = async (roadmapId) => {
    const tasks = await Task.find({ roadmapId });

    if (tasks.length === 0) return;

    const totalProgress = tasks.reduce((acc, task) => acc + task.progressPercentage, 0);
    const overallProgress = Math.round(totalProgress / tasks.length);

    let status = "not-started";
    if (overallProgress === 0) status = "not-started";
    else if (overallProgress === 100) status = "completed";
    else status = "in-progress";

    await Roadmap.findByIdAndUpdate(roadmapId, {
        overallProgress,
        status
    });
};
