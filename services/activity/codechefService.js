const axios = require("axios");

exports.getCodechefData = async (username) => {
    try {
        const url = `https://www.codechef.com/users/${username}`;

        const response = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const html = response.data;
        
        // 🔹 Rating
        const ratingMatch = html.match(/CodeChef Rating.*?(\d+)/);

        // 🔹 Highest Rating
        const maxRatingMatch = html.match(/Highest Rating\s*(\d+)/);

        // 🔹 Global Rank
        const globalMatch = html.match(/Global Rank:\s*(\d+)/);

        // 🔥 Total Problems Solved
        const solvedMatch = html.match(/Total Problems Solved:\s*(\d+)/);
        // 🔥 BADGES (CodeChef)
        const badgeMatches = [...html.matchAll(/Problem Solver - .*?Badge|Daily Streak - .*?Badge/g)];

        const badges = [...new Set(
            badgeMatches.map(b => b[0].trim())
        )];

        return {
            rating: ratingMatch ? parseInt(ratingMatch[1]) : 0,
            maxRating: maxRatingMatch ? parseInt(maxRatingMatch[1]) : 0,
            globalRank: globalMatch ? parseInt(globalMatch[1]) : 0,
            solved: solvedMatch ? parseInt(solvedMatch[1]) : 0,
            badges
        };

    } catch (err) {
        console.error("CodeChef Error:", err.message);
        return null;
    }
};

exports.getCodechefActivity = async (username) => {
    try {
        const axios = require("axios");

        const url = `https://www.codechef.com/recent/user?user_handle=${username}`;

        const response = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const html = response.data.content; // 🔥 IMPORTANT

        if (!html) return [];

        // 🔥 Extract date format: 06/01/26 → convert to YYYY-MM-DD
        const matches = html.match(/\d{2}\/\d{2}\/\d{2}/g) || [];

        const map = {};

        matches.forEach(rawDate => {
            const [day, month, year] = rawDate.split("/");

            const fullYear = "20" + year;

            const formattedDate = `${fullYear}-${month}-${day}`;

            map[formattedDate] = (map[formattedDate] || 0) + 1;
        });

        const activity = [];

        for (const date in map) {
            activity.push({
                date,
                platform: "codechef",
                count: map[date]
            });
        }

        return activity;

    } catch (err) {
        console.error("CodeChef Activity Error:", err.message);
        return [];
    }
};