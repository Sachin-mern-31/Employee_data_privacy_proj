const { generateFullAuditReport } = require("../services/reportService");
const { logAuditTrail } = require("../middleware/auditMiddleware");

// @desc    Generate full executive audit report
// @route   GET /api/reports/full
// @access  Private (SUPER_ADMIN, HR_MANAGER, SECURITY_AUDITOR)
const getFullAuditReport = async (req, res) => {
    try {
        const report = await generateFullAuditReport();

        await logAuditTrail({
            req,
            action: "EXPORT_DATA",
            fieldsAccessed: ["privacyScore", "securityScore", "findings", "risks"],
            sensitivityLevel: "Restricted",
            status: "SUCCESS"
        });

        res.json(report);
    } catch (error) {
        console.error("Get Report Error:", error);
        res.status(500).json({ message: "Server error generating audit report", error: error.message });
    }
};

module.exports = {
    getFullAuditReport
};
