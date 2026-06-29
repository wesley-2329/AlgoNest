const Submission = require('../models/Submission.js');
const Problem = require('../models/Problem.js');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch user submissions
        const submissions = await Submission.find({ userId }).populate('problemId');
        
        let totalCount = submissions.length;
        let acceptedSubmissions = submissions.filter(s => s.verdict === 'Accepted');
        let acceptedCount = acceptedSubmissions.length;

        // 1. Solved problems list (unique problem IDs)
        const solvedProblemIds = new Set();
        acceptedSubmissions.forEach(sub => {
            if (sub.problemId) {
                solvedProblemIds.add(sub.problemId._id.toString());
            }
        });
        const solvedCount = solvedProblemIds.size;

        // 2. Acceptance rate
        const acceptanceRate = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;

        // 3. Language distribution
        const languageStats = {};
        submissions.forEach(sub => {
            languageStats[sub.language] = (languageStats[sub.language] || 0) + 1;
        });

        // 4. Topic/Tag distribution
        const topicStats = {};
        acceptedSubmissions.forEach(sub => {
            if (sub.problemId && sub.problemId.tags) {
                sub.problemId.tags.forEach(tag => {
                    topicStats[tag] = (topicStats[tag] || 0) + 1;
                });
            }
        });

        // 5. Compute Streak (consecutive active days)
        const activeDates = new Set();
        submissions.forEach(sub => {
            const dateStr = new Date(sub.createdAt).toISOString().split('T')[0];
            activeDates.add(dateStr);
        });

        const sortedDates = Array.from(activeDates).sort((a, b) => new Date(b) - new Date(a)); // Descending order
        let streak = 0;
        let todayStr = new Date().toISOString().split('T')[0];
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        let yesterdayStr = yesterday.toISOString().split('T')[0];

        // Check if user was active today or yesterday to continue streak
        let checkDate = null;
        if (activeDates.has(todayStr)) {
            checkDate = new Date(todayStr);
        } else if (activeDates.has(yesterdayStr)) {
            checkDate = new Date(yesterdayStr);
        }

        if (checkDate) {
            streak = 1;
            while (true) {
                checkDate.setDate(checkDate.getDate() - 1);
                const prevDateStr = checkDate.toISOString().split('T')[0];
                if (activeDates.has(prevDateStr)) {
                    streak++;
                } else {
                    break;
                }
            }
        }

        // 6. Submission Heatmap Data (grouped by date)
        const heatmapData = {};
        submissions.forEach(sub => {
            const dateStr = new Date(sub.createdAt).toISOString().split('T')[0];
            heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
        });

        const heatmapArray = Object.keys(heatmapData).map(date => ({
            date,
            count: heatmapData[date]
        }));

        res.json({
            solvedCount,
            totalSubmissions: totalCount,
            acceptanceRate,
            streak,
            languageStats,
            topicStats,
            heatmapData: heatmapArray,
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
    }
};
