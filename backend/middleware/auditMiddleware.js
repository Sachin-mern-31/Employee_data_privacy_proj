const AuditLog = require("../models/AuditLog");
const RetentionPolicy = require("../models/RetentionPolicy");

/**
 * Log an audit entry directly into the AuditLog collection
 * Also checks rule-based anomaly conditions (>X sensitive accesses per hour)
 */
const logAuditTrail = async ({
    req,
    action,
    targetEmployeeId = null,
    targetEmployeeName = null,
    fieldsAccessed = [],
    sensitivityLevel = "Public",
    status = "SUCCESS",
    anomalyReason = null
}) => {
    try {
        if (!req.user) return;

        // Fetch anomaly threshold policy
        let threshold = 10;
        try {
            const policy = await RetentionPolicy.findOne();
            if (policy && policy.anomalyThresholdPerHour) {
                threshold = policy.anomalyThresholdPerHour;
            }
        } catch {
            // Use default if policy fetch fails
        }

        // Anomaly Detection: Count sensitive accesses by this user in the past 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentAccessCount = await AuditLog.countDocuments({
            userId: req.user._id,
            sensitivityLevel: { $in: ["Confidential", "Restricted"] },
            createdAt: { $gte: oneHourAgo }
        });

        let isAnomaly = false;
        let finalAnomalyReason = anomalyReason;

        // Check if access count exceeds limit
        if (
            (sensitivityLevel === "Restricted" || sensitivityLevel === "Confidential") &&
            recentAccessCount >= threshold
        ) {
            isAnomaly = true;
            finalAnomalyReason = `High volume anomaly: ${recentAccessCount + 1} sensitive field accesses in the last hour (Threshold: ${threshold})`;
        }

        // Off-hours access anomaly check (e.g. between 11 PM and 5 AM)
        const currentHour = new Date().getHours();
        if ((currentHour >= 23 || currentHour < 5) && sensitivityLevel === "Restricted") {
            isAnomaly = true;
            finalAnomalyReason = finalAnomalyReason
                ? `${finalAnomalyReason} | Off-hours access at ${currentHour}:00`
                : `Off-hours restricted access detected at ${currentHour}:00`;
        }

        const ipAddress =
            req.headers["x-forwarded-for"] ||
            req.connection?.remoteAddress ||
            req.ip ||
            "127.0.0.1";

        const userAgent = req.headers["user-agent"] || "Unknown Browser";

        await AuditLog.create({
            userId: req.user._id,
            userName: req.user.name,
            userEmail: req.user.email,
            userRole: req.user.role,
            action,
            targetEmployeeId,
            targetEmployeeName,
            fieldsAccessed,
            sensitivityLevel,
            ipAddress,
            userAgent,
            status,
            anomalyFlagged: isAnomaly,
            anomalyReason: finalAnomalyReason
        });
    } catch (error) {
        console.error("Failed to record audit log:", error.message);
    }
};

module.exports = { logAuditTrail };