const RetentionPolicy = require("../models/RetentionPolicy");
const { logAuditTrail } = require("../middleware/auditMiddleware");

// Store in-memory system settings default if DB record absent
let systemSettings = {
    organizationName: "HRShield Security Governance Corp",
    orgEmail: "security-audit@hrshield.com",
    contactPhone: "+1 (800) 555-PRIVACY",
    passwordPolicy: {
        minLength: 12,
        requireNumbers: true,
        requireSymbols: true,
        maxLoginAttempts: 5,
        lockoutDurationMinutes: 15
    },
    auditPolicy: {
        autoAuditCron: "DAILY",
        retentionThresholdDays: 365,
        anomalyAccessThresholdPerHour: 10
    },
    notifications: {
        alertOnCriticalFinding: true,
        alertOnFailedLogins: true,
        digestEmail: "daily"
    }
};

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
    try {
        const policy = await RetentionPolicy.findOne();
        if (policy) {
            systemSettings.auditPolicy.retentionThresholdDays = policy.retentionPeriodDays;
            systemSettings.auditPolicy.anomalyAccessThresholdPerHour = policy.anomalyThresholdPerHour;
        }
        res.json(systemSettings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching settings", error: error.message });
    }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (SUPER_ADMIN)
const updateSettings = async (req, res) => {
    try {
        const { organizationName, orgEmail, passwordPolicy, auditPolicy, notifications } = req.body;

        if (organizationName) systemSettings.organizationName = organizationName;
        if (orgEmail) systemSettings.orgEmail = orgEmail;
        if (passwordPolicy) systemSettings.passwordPolicy = { ...systemSettings.passwordPolicy, ...passwordPolicy };
        if (auditPolicy) systemSettings.auditPolicy = { ...systemSettings.auditPolicy, ...auditPolicy };
        if (notifications) systemSettings.notifications = { ...systemSettings.notifications, ...notifications };

        // Also update RetentionPolicy DB model
        let policy = await RetentionPolicy.findOne();
        if (!policy) {
            policy = new RetentionPolicy();
        }
        if (auditPolicy?.retentionThresholdDays) {
            policy.retentionPeriodDays = auditPolicy.retentionThresholdDays;
        }
        if (auditPolicy?.anomalyAccessThresholdPerHour) {
            policy.anomalyThresholdPerHour = auditPolicy.anomalyAccessThresholdPerHour;
        }
        policy.updatedBy = req.user.email;
        await policy.save();

        await logAuditTrail({
            req,
            action: "POLICY_UPDATE",
            fieldsAccessed: ["organizationName", "passwordPolicy", "auditPolicy"],
            sensitivityLevel: "Confidential",
            status: "SUCCESS"
        });

        res.json(systemSettings);
    } catch (error) {
        console.error("Update Settings Error:", error);
        res.status(500).json({ message: "Server error updating settings", error: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
