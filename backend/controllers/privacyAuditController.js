const { runFullSystemAudit } = require("../services/auditEngineService");
const Finding = require("../models/Finding");
const ConsentRecord = require("../models/ConsentRecord");
const PrivacyControl = require("../models/PrivacyControl");
const { logAuditTrail } = require("../middleware/auditMiddleware");

// @desc    Get privacy audit overview & checks
// @route   GET /api/privacy/audit
// @access  Private (SUPER_ADMIN, HR_MANAGER, SECURITY_AUDITOR)
const getPrivacyAudit = async (req, res) => {
    try {
        const auditResults = await runFullSystemAudit();

        await logAuditTrail({
            req,
            action: "READ_GENERAL",
            fieldsAccessed: ["privacyChecks", "privacyScore"],
            sensitivityLevel: "Confidential"
        });

        const privacyFindings = await Finding.find({ auditType: "PRIVACY" }).sort({ createdAt: -1 });
        const controls = await PrivacyControl.find();

        res.json({
            privacyScore: auditResults.scores.privacyScore,
            summary: auditResults.privacySummary,
            checks: auditResults.privacyChecks,
            findings: privacyFindings,
            controls,
            lastAudited: auditResults.timestamp
        });
    } catch (error) {
        console.error("Get Privacy Audit Error:", error);
        res.status(500).json({ message: "Server error executing privacy audit", error: error.message });
    }
};

// @desc    Run manual Privacy Audit scan
// @route   POST /api/privacy/audit/run
// @access  Private (SUPER_ADMIN, HR_MANAGER, SECURITY_AUDITOR)
const runPrivacyAuditScan = async (req, res) => {
    try {
        const auditResults = await runFullSystemAudit();

        await logAuditTrail({
            req,
            action: "POLICY_UPDATE",
            fieldsAccessed: ["PRIVACY_AUDIT_EXECUTION"],
            sensitivityLevel: "Confidential"
        });

        res.json({
            message: "Automated Privacy Audit completed successfully.",
            privacyScore: auditResults.scores.privacyScore,
            summary: auditResults.privacySummary,
            checks: auditResults.privacyChecks,
            findingsGenerated: auditResults.findingsGeneratedCount
        });
    } catch (error) {
        console.error("Run Privacy Scan Error:", error);
        res.status(500).json({ message: "Server error running privacy scan", error: error.message });
    }
};

module.exports = {
    getPrivacyAudit,
    runPrivacyAuditScan
};
