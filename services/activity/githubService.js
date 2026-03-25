const axios = require("axios");

const GITHUB_API = "https://api.github.com/graphql";

const normalizeGithub = (weeks) => {
    const activity = [];

    weeks.forEach(week => {
        week.contributionDays.forEach(day => {
            activity.push({
                date: day.date,
                platform: "github",
                count: day.contributionCount
            });
        });
    });

    return activity;
};

exports.getGithubData = async (username) => {
    try {
        const query = {
            query: `
                query($username: String!) {
                    user(login: $username) {
                        contributionsCollection {
                            contributionCalendar {
                                weeks {
                                    contributionDays {
                                        date
                                        contributionCount
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            variables: { username }
        };

        const response = await axios.post(
            GITHUB_API,
            query,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
                }
            }
        );

        const weeks =
            response.data.data.user.contributionsCollection.contributionCalendar.weeks;

        return normalizeGithub(weeks);

    } catch (err) {
        console.error("GitHub Fetch Error:", err.message);
        return null;
    }
};