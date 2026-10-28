const Finding = require("../models/Finding");
const { logAuditTrail } = require("../middleware/auditMiddleware");

// @desc    Get all audit findings with search and filters
// @route   GET /api/findings
// @access  Private (SUPER_ADMIN, HR_MANAGER, SECURITY_AUDITOR)
const getFindings = async (req, res) => {
    try {
        const { severity, category, status, auditType, search } = req.query;
        let query = {};

        if (severity) query.severity = severity;
        if (category) query.category = category;
        if (status) query.status = status;
        if (auditType) query.auditType = auditType;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { findingId: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { affectedResource: { $regex: search, $options: "i" } },
                { assignedOwner: { $regex: search, $options: "i" } }
            ];
        }

        const findings = await Finding.find(query).sort({ severity: -1, createdAt: -1 });
        res.json(findings);
    } catch (error) {
        console.error("Get Findings Error:", error);
        res.status(500).json({ message: "Server error fetching findings", error: error.message });
    }
};

// @desc    Get single finding detail
// @route   GET /api/findings/:id
// @access  Private
const getFindingById = async (req, res) => {
    try {
        const finding = await Finding.findById(req.params.id);
        if (!finding) return res.status(404).json({ message: "Finding not found" });
        res.json(finding);
    } catch (error) {
        res.status(500).json({ message: "Error fetching finding", error: error.message });
    }
};

// @desc    Update finding remediation status / assign owner / add notes
// @route   PUT /api/findings/:id
// @access  Private (SUPER_ADMIN, HR_MANAGER, SECURITY_AUDITOR)
const updateFindingRemediation = async (req, res) => {
    try {
        const { status, assignedOwner, dueDate, remediationNotes } = req.body;
        const finding = await Finding.findById(req.params.id);

        if (!finding) {
            return res.status(404).json({ message: "Finding not found" });
        }

        const prevStatus = finding.status;

        if (status) finding.status = status;
        if (assignedOwner) finding.assignedOwner = assignedOwner;
        if (dueDate) finding.dueDate = dueDate;
        if (remediationNotes) finding.remediationNotes = remediationNotes;

        if (status === "RESOLVED" && prevStatus !== "RESOLVED") {
            finding.resolutionDate = new Date();
        }

        // Add history log entry
        finding.remediationHistory.push({
            updatedBy: req.user.name + ` (${req.user.role})`,
            previousStatus: prevStatus,
            newStatus: status || prevStatus,
            note: remediationNotes || "Finding status updated."
        });

        await finding.save();

        await logAuditTrail({
            req,
            action: "POLICY_UPDATE",
            fieldsAccessed: ["status", "assignedOwner", "remediationNotes"],
            sensitivityLevel: "Confidential",
            status: "SUCCESS"
        });

        res.json(finding);
    } catch (error) {
        console.error("Update Finding Error:", error);
        res.status(500).json({ message: "Server error updating remediation", error: error.message });
    }
};

module.exports = {
    getFindings,
    getFindingById,
    updateFindingRemediation
};
