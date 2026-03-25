const axios = require("axios");

exports.getHackerRankData = async (username) => {
    try {
        const url = `https://www.hackerrank.com/profile/${username}`;

        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const html = response.data;

        // 🔥 Extract solved count (basic regex)
        const match = html.match(/"solved_challenges":(\d+)/);

        return {
            solved: match ? parseInt(match[1]) : 0
        };

    } catch (err) {
        console.error("HackerRank Error:", err.message);
        return null;
    }
};