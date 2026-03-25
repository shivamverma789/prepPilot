const axios = require("axios");

const LEETCODE_API = "https://leetcode.com/graphql";

const extractTotalSolved = (stats) => {
    const all = stats.acSubmissionNum.find(
        (item) => item.difficulty === "All"
    );
    return all ? all.count : 0;
};

const normalizeCalendar = (calendar) => {
    const activity = [];

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    for (const timestamp in calendar) {
        const dateObj = new Date(parseInt(timestamp) * 1000);

        if (dateObj < oneYearAgo) continue; // 🔥 filter

        const date = dateObj.toISOString().split("T")[0];

        activity.push({
            date,
            platform: "leetcode",
            count: calendar[timestamp]
        });
    }

    return activity;
};

exports.getLeetCodeData = async (username) => {
    try {
        const query = {
            query: `
                query userProfileCalendar($username: String!) {
                    matchedUser(username: $username) {
                        submitStats {
                            acSubmissionNum {
                                difficulty
                                count
                            }
                        }
                        userCalendar {
                            submissionCalendar
                        }
                    }
                }
            `,
            variables: { username }
        };

        const response = await axios.post(LEETCODE_API, query);
        // console.log(JSON.stringify(response.data, null, 2));
        const data = response.data.data.matchedUser;
        

        if (!data) throw new Error("Invalid username");

        const totalSolved = extractTotalSolved(data.submitStats);
        const rawCalendar = JSON.parse(data.userCalendar.submissionCalendar);

        const activity = normalizeCalendar(rawCalendar);

        return { totalSolved, activity };

    } catch (err) {
        console.error(err.message);
        return null;
    }
};