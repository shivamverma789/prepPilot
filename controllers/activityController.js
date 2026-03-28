const UserPlatform = require("../models/userPlatformModel");
const User = require("../models/userModel");
const { getLeetCodeData } = require("../services/activity/leetcodeService");
const { saveActivities } = require("../services/activity/activityService");
const { getGithubData } = require("../services/activity/githubService");
const { getCodeforcesData,getCodeforcesProfile } = require("../services/activity/codeforcesService");
const { getHackerRankData } = require("../services/activity/hackerrankService");
const { getCodechefData } = require("../services/activity/codechefService");
const { getCodechefActivity } = require("../services/activity/codechefService");
const Activity = require("../models/activityModel");

exports.getDashboard = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const userId = req.user._id;
        const selectedPlatform = req.query.platform || "all";
        // 🔥 1. Fetch data
        const activities = await Activity.find({ userId });
        const userPlatform = await UserPlatform.findOne({ userId });
        // const totalSolved = userPlatform?.leetcodeSolved || 0;

        const leetcodeSolved = userPlatform?.leetcodeSolved || 0;
        const codechefSolved = userPlatform?.codechefSolved || 0;
        const codeforcesSolved = userPlatform?.cfSolved || 0;
        const cfRating = userPlatform?.codeforcesRating || 0;
        const cfMaxRating = userPlatform?.codeforcesMaxRating || 0;
        const cfRank = userPlatform?.codeforcesRank || "unrated";
        const hackerrankSolved = userPlatform?.hackerrankSolved || 0;
        const codechefRating = userPlatform?.codechefRating || 0;
        const codechefMaxRating = userPlatform?.codechefMaxRating || 0;
        const codechefGlobalRank = userPlatform?.codechefGlobalRank || 0;
        const codechefBadges = userPlatform?.codechefBadges || [];

        let totalSolved = 0;

        if (selectedPlatform === "leetcode") {
            totalSolved = leetcodeSolved;
        } 
        else if (selectedPlatform === "codechef") {
            totalSolved = codechefSolved;
        } 
        else if (selectedPlatform === "codeforces") {
            totalSolved = codeforcesSolved;
        } 
        else {
            totalSolved = leetcodeSolved + codechefSolved + codeforcesSolved;
        }
        const solvedBreakdown = {
            leetcode: leetcodeSolved,
            codechef: codechefSolved,
            codeforces: codeforcesSolved
        };
        // 🔥 2. Merge by date
        const merged = {};

        activities.forEach(item => {

            if (selectedPlatform !== "all" && item.platform !== selectedPlatform) {
                return;
            }

            merged[item.date] = (merged[item.date] || 0) + item.count;
        });
        const activeDays = Object.keys(merged)
            .filter(date => merged[date] > 0)
            .length;

        const activeDates = Object.keys(merged)
        .filter(date => merged[date] > 0)
        .sort((a, b) => new Date(a) - new Date(b));

        let longestStreak = 0;
        let tempStreak = 0;

        for (let i = 0; i < activeDates.length; i++) {
            if (i === 0) {
                tempStreak = 1;
            } else {
                const prev = new Date(activeDates[i - 1]);
                const curr = new Date(activeDates[i]);

                const diff = (curr - prev) / (1000 * 60 * 60 * 24);

                if (diff === 1) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }
            }

            longestStreak = Math.max(longestStreak, tempStreak);
        }

        let currentStreak = 0;

        let today = new Date();
        today.setHours(0,0,0,0);

        // 🔥 Check today or fallback to yesterday
        let checkDate = new Date(today);

        const todayStr = checkDate.toISOString().split("T")[0];

        if (!merged[todayStr]) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const dateStr = checkDate.toISOString().split("T")[0];

            if (merged[dateStr] > 0) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        const totalActivity = Object.values(merged)
            .reduce((sum, val) => sum + val, 0);
        // 🔥 3. 👉 PUT YOUR CODE HERE (REPLACE OLD heatmapData LOGIC)

        // const today = new Date();
        const days = [];

        for (let i = 0; i < 365; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);

            const date = d.toISOString().split("T")[0];

            days.push({
                date,
                count: merged[date] || 0,
                day: d.getDay()
            });
        }

        days.reverse();

        const weeks = [];
        let week = new Array(7).fill(null);

        days.forEach((dayObj) => {
            week[dayObj.day] = dayObj;

            if (dayObj.day === 6) {
                weeks.push(week);
                week = new Array(7).fill(null);
            }
        });

        // push last week if not empty
        if (week.some(d => d !== null)) {
            weeks.push(week);
        }
        const months = [];

weeks.forEach(week => {
    const firstDay = week.find(d => d !== null);

    if (!firstDay) return;

    const monthName = new Date(firstDay.date).toLocaleString("default", {
        month: "short",
        year: "numeric"
    });

    let monthObj = months.find(m => m.name === monthName);

    if (!monthObj) {
        monthObj = {
            name: monthName,
            weeks: []
        };
        months.push(monthObj);
    }

    monthObj.weeks.push(week);
});
        
        // 🔥 4. Send weeks to view
        res.render("activity/dashboard", { 
            user: req.user,
            weeks,
            months,
            selectedPlatform ,
            totalSolved,
            solvedBreakdown,
            activeDays,
            totalActivity,
            currentStreak,
            longestStreak,
            cfRating,
            cfMaxRating,
            cfRank,
            hackerrankSolved,
            codechefRating,
            codechefMaxRating,
            codechefGlobalRank,
            codechefSolved,
            codechefBadges

        });

    } catch (err) {
        console.error(err);
        res.status(500).render("error", { message: process.env.NODE_ENV !== "production" ? err.message : null });
    }
};

exports.getProfilePage = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const userPlatforms = await UserPlatform.findOne({
            userId: req.user._id
        });

        res.render("activity/profile", { userPlatforms });

    } catch (err) {
        console.error(err);
        res.status(500).render("error", { message: process.env.NODE_ENV !== "production" ? err.message : null });
    }
};

exports.saveProfile = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const { 
            leetcodeUsername, 
            githubUsername, 
            codeforcesHandle,
            hackerrankUsername,
            codechefUsername 
        } = req.body;

        const userId = req.user._id;

        // 🔥 STEP 1 — get existing data
        const existing = await UserPlatform.findOne({ userId });

        // 🔥 STEP 2 — detect changes
        const leetcodeChanged = existing && existing.leetcodeUsername !== leetcodeUsername;
        const githubChanged = existing && existing.githubUsername !== githubUsername;
        const codeforcesChanged = existing && existing.codeforcesHandle !== codeforcesHandle;
        const codechefChanged = existing && existing.codechefUsername !== codechefUsername;

        // 🔥 STEP 3 — delete old activity if changed
        if (leetcodeChanged) {
            await Activity.deleteMany({ userId, platform: "leetcode" });
        }

        if (githubChanged) {
            await Activity.deleteMany({ userId, platform: "github" });
        }

        if (codeforcesChanged) {
            await Activity.deleteMany({ userId, platform: "codeforces" });
        }

        if (codechefChanged) {
            await Activity.deleteMany({ userId, platform: "codechef" });
        }

        // 🔥 STEP 4 — update profile
        await UserPlatform.findOneAndUpdate(
            { userId },
            {
                leetcodeUsername,
                githubUsername,
                codeforcesHandle,
                hackerrankUsername,
                codechefUsername
            },
            { upsert: true, returnDocument: "after" }
        );

        res.redirect("/activity/activity-dashboard");

    } catch (err) {
        console.error("Save Profile Error:", err);
        res.status(500).render("error", { message: process.env.NODE_ENV !== "production" ? err.message : null });
    }
};

exports.syncLeetCode = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const userId = req.user._id;

        const userPlatform = await UserPlatform.findOne({ userId });

        if (!userPlatform || !userPlatform.leetcodeUsername) {
            return res.redirect("/activity/activity-profile");
        }

        const data = await getLeetCodeData(userPlatform.leetcodeUsername);

        if (!data) {
            return res.status(502).render("error", { message: "Failed to fetch LeetCode data. Try again later." });
        }

        // 🔥 Save activity
        await saveActivities(userId, data.activity);

        // 🔥 NEW: Save total solved
        await UserPlatform.findOneAndUpdate(
            { userId },
            {
                leetcodeSolved: data.totalSolved
            },
            { returnDocument: "after" }
        );

        res.redirect("/activity/activity-dashboard");

    } catch (err) {
        console.error(err);
        res.status(500).render("error", { message: process.env.NODE_ENV !== "production" ? err.message : null });
    }
};

exports.syncGithub = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const userId = req.user._id;

        const userPlatform = await UserPlatform.findOne({ userId });

        if (!userPlatform || !userPlatform.githubUsername) {
            return res.redirect("/activity/activity-profile");
        }

        const data = await getGithubData(userPlatform.githubUsername);

        if (!data) {
            return res.status(502).render("error", { message: "Failed to fetch GitHub data. Try again later." });
        }

        await saveActivities(userId, data);

        res.redirect("/activity/activity-dashboard");

    } catch (err) {
        console.error(err);
        res.status(500).render("error", { message: process.env.NODE_ENV !== "production" ? err.message : null });
    }
};

exports.syncCodeforces = async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.redirect("/login");
        }
        const userId = req.user._id;

        const userPlatform = await UserPlatform.findOne({ userId });

        if (!userPlatform || !userPlatform.codeforcesHandle) {
            return res.redirect("/activity/activity-profile");
        }

        const data = await getCodeforcesData(userPlatform.codeforcesHandle);
        const profile = await getCodeforcesProfile(userPlatform.codeforcesHandle);
        if (!data) {
            return res.status(502).render("error", { message: "Failed to fetch Codeforces data. Try again later." });
        }

        await saveActivities(userId, data);
        if (profile) {
            await UserPlatform.findOneAndUpdate(
                { userId },
                {
                    codeforcesRating: profile.rating,
                    codeforcesMaxRating: profile.maxRating,
                    codeforcesRank: profile.rank
                },
                { returnDocument: "after" }
            );
        }
        res.redirect("/activity/activity-dashboard");

    } catch (err) {
        console.error(err);
        res.status(500).render("error", { message: process.env.NODE_ENV !== "production" ? err.message : null });
    }
};

exports.syncHackerRank = async (req, res) => {
    try {
        const userId = req.user._id;

        const userPlatform = await UserPlatform.findOne({ userId });

        if (!userPlatform?.hackerrankUsername) {
            return res.redirect("/activity/activity-profile");
        }

        const data = await getHackerRankData(userPlatform.hackerrankUsername);

        if (!data) {
            return res.status(502).render("error", { message: "Failed to fetch HackerRank data. Try again later." });
        }

        await UserPlatform.findOneAndUpdate(
            { userId },
            {
                hackerrankSolved: data.solved
            },
            { returnDocument: "after" }
        );

        res.redirect("/activity/activity-dashboard");

    } catch (err) {
        console.error(err);
        res.send("Error syncing HackerRank");
    }
};

exports.syncCodechef = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const userId = req.user._id;

        const userPlatform = await UserPlatform.findOne({ userId });

        if (!userPlatform || !userPlatform.codechefUsername) {
            return res.send("CodeChef username not set");
        }

        // 🔥 Fetch data
        const data = await getCodechefData(userPlatform.codechefUsername);
        const activity = await getCodechefActivity(userPlatform.codechefUsername);
        if (!data) {
            return res.send("Failed to fetch CodeChef data");
        }
        await saveActivities(userId, activity);
        // 🔥 Save to DB
        await UserPlatform.findOneAndUpdate(
            { userId },
            {
                codechefRating: data.rating,
                codechefMaxRating: data.maxRating,
                codechefGlobalRank: data.globalRank,
                codechefSolved: data.solved,
                codechefBadges: data.badges,
                codechefLastSynced: new Date()
            },
            { returnDocument: "after" }
        );

        res.redirect("/activity/activity-dashboard");

    } catch (err) {
        console.error(err);
        res.send("Error syncing CodeChef");
    }
};


exports.syncAllPlatforms = async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        }

        const userId = req.user._id;

        const userPlatform = await UserPlatform.findOne({ userId });

        if (!userPlatform) {
            return res.send("No platforms found");
        }

        // 🔥 1. LEETCODE (same as syncLeetCode)
        if (userPlatform.leetcodeUsername) {
            const data = await getLeetCodeData(userPlatform.leetcodeUsername);

            if (data) {
                await saveActivities(userId, data.activity);

                await UserPlatform.findOneAndUpdate(
                    { userId },
                    { leetcodeSolved: data.totalSolved },
                    { returnDocument: "after" }
                );
            }
        }

        // 🔥 2. GITHUB (same as syncGithub)
        if (userPlatform.githubUsername) {
            const data = await getGithubData(userPlatform.githubUsername);

            if (data) {
                await saveActivities(userId, data);
            }
        }

        // 🔥 3. CODEFORCES (same as syncCodeforces)
        if (userPlatform.codeforcesHandle) {
            const data = await getCodeforcesData(userPlatform.codeforcesHandle);
            const profile = await getCodeforcesProfile(userPlatform.codeforcesHandle);

            if (data) {
                await saveActivities(userId, data);
            }

            if (profile) {
                await UserPlatform.findOneAndUpdate(
                    { userId },
                    {
                        codeforcesRating: profile.rating,
                        codeforcesMaxRating: profile.maxRating,
                        codeforcesRank: profile.rank
                    },
                    { returnDocument: "after" }
                );
            }
        }

        // 🔥 4. CODECHEF (same as syncCodechef)
        if (userPlatform.codechefUsername) {
            const data = await getCodechefData(userPlatform.codechefUsername);
            const activity = await getCodechefActivity(userPlatform.codechefUsername);

            if (activity) {
                await saveActivities(userId, activity);
            }

            if (data) {
                await UserPlatform.findOneAndUpdate(
                    { userId },
                    {
                        codechefRating: data.rating,
                        codechefMaxRating: data.maxRating,
                        codechefGlobalRank: data.globalRank,
                        codechefSolved: data.solved,
                        codechefBadges: data.badges,
                        codechefLastSynced: new Date()
                    },
                    { returnDocument: "after" }
                );
            }
        }

        // 🔥 5. HACKERRANK (same as syncHackerRank)
        if (userPlatform.hackerrankUsername) {
            const data = await getHackerRankData(userPlatform.hackerrankUsername);

            if (data) {
                await UserPlatform.findOneAndUpdate(
                    { userId },
                    { hackerrankSolved: data.solved },
                    { returnDocument: "after" }
                );
            }
        }

        res.redirect("/activity/activity-dashboard");

    } catch (err) {
        console.error("Sync All Error:", err);
        res.send("Error syncing all platforms");
    }
};

exports.getPublicProfile = async (req, res) => {
    try {
        const username = req.params.username;

        // 🔥 find user
        const user = await User.findOne({ username });

        if (!user) {
            return res.send("User not found");
        }

        const userId = user._id;

        // 🔥 get platform data
        const userPlatform = await UserPlatform.findOne({ userId });

        // 🔥 get activity
        const activities = await Activity.find({ userId });

        // 🔥 build map
        const map = {};
        activities.forEach(a => {
            map[a.date] = (map[a.date] || 0) + a.count;
        });

        // 🔥 build 365 days
        const today = new Date();
        const days = [];

        for (let i = 0; i < 365; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);

            const date = d.toISOString().split("T")[0];

            days.push({
                date,
                count: map[date] || 0,
                day: d.getDay()
            });
        }

        days.reverse();

        // 🔥 group months (reuse your logic)
        const months = [];
        let currentMonth = null;

        days.forEach(day => {
            const m = day.date.slice(0, 7);

            if (!currentMonth || currentMonth.name !== m) {
                currentMonth = { name: m, weeks: [] };
                months.push(currentMonth);
            }

            if (
                currentMonth.weeks.length === 0 ||
                day.day === 0
            ) {
                currentMonth.weeks.push([]);
            }

            currentMonth.weeks[currentMonth.weeks.length - 1].push(day);
        });

        // 🔥 stats
        const totalActivity = activities.reduce((sum, a) => sum + a.count, 0);
        const activeDays = Object.keys(map).length;

        const totalSolved =
            (userPlatform?.leetcodeSolved || 0) +
            (userPlatform?.codechefSolved || 0);

        res.render("activity/publicProfile", {
            user,
            userPlatform,
            months,
            totalActivity,
            activeDays,
            totalSolved
        });

    } catch (err) {
        console.error(err);
        res.send("Error loading profile");
    }
};