const Activity = require("../../models/activityModel");

exports.saveActivities = async (userId, activities) => {
    try {
        const bulkOps = activities.map((item) => ({
            updateOne: {
                filter: {
                    userId,
                    date: item.date,
                    platform: item.platform
                },
                update: {
                    $set: {
                        count: item.count
                    }
                },
                upsert: true
            }
        }));

        await Activity.bulkWrite(bulkOps);

    } catch (err) {
        console.error("Activity Save Error:", err);
    }
};