const Employee = require("../models/Employee");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Finding = require("../models/Finding");
const Risk = require("../models/Risk");
const SecurityAlert = require("../models/SecurityAlert");
const { runFullSystemAudit } = require("../services/auditEngineService");

// @desc    Get executive security & privacy dashboard overview metrics
// @route   GET /api/dashboard/overview
// @access  Private (SUPER_ADMIN, HR_MANAGER, SECURITY_AUDITOR, HR_STAFF)
const getDashboardOverview = async (req, res) => {
    try {
        // Run audit engine to get exact real scores
        const auditResults = await runFullSystemAudit();

        const totalEmployees = await Employee.countDocuments({ isArchived: { $ne: true } });
        const activeEmployees = await Employee.countDocuments({ status: "ACTIVE", isArchived: { $ne: true } });
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalAuditLogs = await AuditLog.countDocuments();
        const flaggedAnomalies = await AuditLog.countDocuments({ anomalyFlagged: true });
        
        const openFindings = await Finding.countDocuments({ status: { $in: ["OPEN", "INVESTIGATING", "REMEDIATION_IN_PROGRESS"] } });
        const highRiskFindings = await Finding.countDocuments({ severity: { $in: ["HIGH", "CRITICAL"] }, status: { $ne: "RESOLVED" } });
        const unreadAlerts = await SecurityAlert.countDocuments({ isRead: false });

        // Findings distribution by category
        const findingsByCategory = await Finding.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Security Risk distribution (Low, Medium, High, Critical)
        const riskDistribution = await Finding.aggregate([
            { $group: { _id: "$severity", count: { $sum: 1 } } }
        ]);

        const riskMap = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
        riskDistribution.forEach(item => {
            if (item._id && riskMap.hasOwnProperty(item._id)) {
                riskMap[item._id] = item.count;
            }
        });

        // Sensitivity Access breakdown
        const sensitivityDistribution = await AuditLog.aggregate([
            { $group: { _id: "$sensitivityLevel", count: { $sum: 1 } } }
        ]);

        const sensitivityMap = { Public: 0, Internal: 0, Confidential: 0, Restricted: 0 };
        sensitivityDistribution.forEach(item => {
            if (item._id && sensitivityMap.hasOwnProperty(item._id)) {
                sensitivityMap[item._id] = item.count;
            }
        });

        // Recent Audit Activity / Anomalies
        const recentAuditActivity = await AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(6);

        // Access Activity Trend (Last 7 Days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const dailyAccessTrend = await AuditLog.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    successful: { $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] } },
                    denied: { $sum: { $cond: [{ $eq: ["$status", "DENIED"] }, 1, 0] } },
                    suspicious: { $sum: { $cond: ["$anomalyFlagged", 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            metrics: {
                totalEmployees,
                activeEmployees,
                totalUsers,
                activeUsers,
                privacyScore: auditResults.scores.privacyScore,
                securityScore: auditResults.scores.securityScore,
                overallScore: auditResults.scores.overallScore,
                openFindings,
                highRiskFindings,
                totalAuditLogs,
                flaggedAnomalies,
                unreadAlerts
            },
            scores: auditResults.scores,
            privacyAuditSummary: auditResults.privacySummary,
            securityAuditSummary: auditResults.securitySummary,
            privacyChecks: auditResults.privacyChecks,
            securityChecks: auditResults.securityChecks,
            riskMap,
            sensitivityMap,
            findingsByCategory: findingsByCategory.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            dailyAccessTrend,
            recentAuditActivity
        });
    } catch (error) {
        console.error("Dashboard Overview Error:", error);
        res.status(500).json({ message: "Server error fetching dashboard metrics", error: error.message });
    }
};

module.exports = {
    getDashboardOverview
};
