const { runFullSystemAudit } = require("../services/auditEngineService");
const Finding = require("../models/Finding");
const SecurityAlert = require("../models/SecurityAlert");
const AuditLog = require("../models/AuditLog");
const { logAuditTrail } = require("../middleware/auditMiddleware");

// @desc    Run automated Security Audit engine & fetch security posture
// @route   GET /api/security/audit
// @access  Private (SUPER_ADMIN, HR_MANAGER, SECURITY_AUDITOR)
const getSecurityAudit = async (req, res) => {
    try {
        const auditResults = await runFullSystemAudit();

        await logAuditTrail({
            req,
            action: "READ_GENERAL",
            fieldsAccessed: ["securityChecks", "securityScore"],
            sensitivityLevel: "Confidential"
        });

        const securityFindings = await Finding.find({ auditType: "SECURITY" }).sort({ createdAt: -1 });

        res.json({
            securityScore: auditResults.scores.securityScore,
            summary: auditResults.securitySummary,
            checks: auditResults.securityChecks,
            findings: securityFindings,
            lastAudited: auditResults.timestamp
        });
    } catch (error) {
        console.error("Get Security Audit Error:", error);
        res.status(500).json({ message: "Server error executing security audit", error: error.message });
    }
};

// @desc    Trigger manual Security Audit re-scan
// @route   POST /api/security/audit/run
// @access  Private (SUPER_ADMIN, SECURITY_AUDITOR)
const runSecurityAuditScan = async (req, res) => {
    try {
        const auditResults = await runFullSystemAudit();

        await logAuditTrail({
            req,
            action: "POLICY_UPDATE",
            fieldsAccessed: ["SECURITY_AUDIT_EXECUTION"],
            sensitivityLevel: "Confidential"
        });

        res.json({
            message: "Automated Security Audit completed successfully.",
            securityScore: auditResults.scores.securityScore,
            summary: auditResults.securitySummary,
            checks: auditResults.securityChecks,
            findingsGenerated: auditResults.findingsGeneratedCount
        });
    } catch (error) {
        console.error("Run Security Audit Scan Error:", error);
        res.status(500).json({ message: "Server error triggering security scan", error: error.message });
    }
};

module.exports = {
    getSecurityAudit,
    runSecurityAuditScan
};
