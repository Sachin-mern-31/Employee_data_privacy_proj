const AuditLog = require("../models/AuditLog");

// @desc    Get all audit logs with query filters
// @route   GET /api/audit-logs
// @access  Private (SUPER_ADMIN only)
const getAuditLogs = async (req, res) => {
    try {
        const { sensitivityLevel, anomalyOnly, userRole, search, limit = 100 } = req.query;

        let query = {};

        if (sensitivityLevel) {
            query.sensitivityLevel = sensitivityLevel;
        }

        if (anomalyOnly === "true") {
            query.anomalyFlagged = true;
        }

        if (userRole) {
            query.userRole = userRole;
        }

        if (search) {
            query.$or = [
                { userName: { $regex: search, $options: "i" } },
                { userEmail: { $regex: search, $options: "i" } },
                { targetEmployeeId: { $regex: search, $options: "i" } },
                { targetEmployeeName: { $regex: search, $options: "i" } },
                { action: { $regex: search, $options: "i" } },
                { ipAddress: { $regex: search, $options: "i" } }
            ];
        }

        const logs = await AuditLog.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        res.json(logs);
    } catch (error) {
        console.error("Get Audit Logs Error:", error);
        res.status(500).json({ message: "Server error fetching audit logs", error: error.message });
    }
};

// @desc    Get Audit Log Aggregated Stats for Dashboard
// @route   GET /api/audit-logs/stats
// @access  Private (SUPER_ADMIN)
const getAuditStats = async (req, res) => {
    try {
        // Sensitivity distribution
        const sensitivityStats = await AuditLog.aggregate([
            { $group: { _id: "$sensitivityLevel", count: { $sum: 1 } } }
        ]);

        // Top accessors of sensitive data
        const topAccessors = await AuditLog.aggregate([
            { $match: { sensitivityLevel: { $in: ["Confidential", "Restricted"] } } },
            { $group: { _id: "$userEmail", userName: { $first: "$userName" }, userRole: { $first: "$userRole" }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Anomaly count
        const totalAnomalies = await AuditLog.countDocuments({ anomalyFlagged: true });
        const totalLogs = await AuditLog.countDocuments();

        // Accesses over time (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const dailyTrends = await AuditLog.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: 1 },
                    sensitive: {
                        $sum: {
                            $cond: [{ $in: ["$sensitivityLevel", ["Confidential", "Restricted"]] }, 1, 0]
                        }
                    },
                    anomalies: {
                        $sum: { $cond: ["$anomalyFlagged", 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            totalLogs,
            totalAnomalies,
            sensitivityStats: sensitivityStats.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            topAccessors,
            dailyTrends
        });
    } catch (error) {
        console.error("Get Audit Stats Error:", error);
        res.status(500).json({ message: "Server error fetching audit statistics", error: error.message });
    }
};

module.exports = {
    getAuditLogs,
    getAuditStats
};
