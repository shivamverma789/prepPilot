const axios = require("axios");

const normalizeCodeforces = (submissions) => {
    const map = {};

    submissions.forEach(sub => {
        if (sub.verdict !== "OK") return; // only accepted

        const date = new Date(sub.creationTimeSeconds * 1000)
            .toISOString()
            .split("T")[0];

        map[date] = (map[date] || 0) + 1;
    });

    const activity = [];

    for (const date in map) {
        activity.push({
            date,
            platform: "codeforces",
            count: map[date]
        });
    }

    return activity;
};

exports.getCodeforcesData = async (handle) => {
    try {
        const url = `https://codeforces.com/api/user.status?handle=${handle}`;

        const response = await axios.get(url);

        if (response.data.status !== "OK") {
            throw new Error("Invalid handle");
        }

        const submissions = response.data.result;

        return normalizeCodeforces(submissions);

    } catch (err) {
        console.error("Codeforces Fetch Error:", err.message);
        return null;
    }
};
exports.getCodeforcesProfile = async (handle) => {
    try {
        const url = `https://codeforces.com/api/user.info?handles=${handle}`;

        const response = await axios.get(url);

        if (response.data.status !== "OK") {
            throw new Error("Invalid handle");
        }

        const user = response.data.result[0];

        return {
            rating: user.rating || 0,
            maxRating: user.maxRating || 0,
            rank: user.rank || "unrated"
        };

    } catch (err) {
        console.error("Codeforces Profile Error:", err.message);
        return null;
    }
};