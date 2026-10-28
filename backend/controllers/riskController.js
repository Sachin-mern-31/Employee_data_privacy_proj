const Risk = require("../models/Risk");
const { calculateRiskMatrix } = require("../services/riskService");
const { logAuditTrail } = require("../middleware/auditMiddleware");

// @desc    Get all risks with matrix calculation
// @route   GET /api/risks
// @access  Private (SUPER_ADMIN, HR_MANAGER, SECURITY_AUDITOR)
const getRisks = async (req, res) => {
    try {
        const risks = await Risk.find().sort({ riskScore: -1, createdAt: -1 });

        // Compile 3x3 Risk Matrix distribution count
        const matrixMap = {
            LOW_LOW: 0, LOW_MED: 0, LOW_HIGH: 0,
            MED_LOW: 0, MED_MED: 0, MED_HIGH: 0,
            HIGH_LOW: 0, HIGH_MED: 0, HIGH_HIGH: 0
        };

        risks.forEach(r => {
            const key = `${r.likelihood.substring(0, 3)}_${r.impact.substring(0, 3)}`;
            if (matrixMap.hasOwnProperty(key)) {
                matrixMap[key]++;
            }
        });

        res.json({
            risks,
            matrixMap
        });
    } catch (error) {
        console.error("Get Risks Error:", error);
        res.status(500).json({ message: "Server error fetching risk management data", error: error.message });
    }
};

// @desc    Create new Risk record
// @route   POST /api/risks
// @access  Private (SUPER_ADMIN, SECURITY_AUDITOR)
const createRisk = async (req, res) => {
    try {
        const { riskId, title, category, description, likelihood, impact, affectedAsset, owner, remediation, dueDate } = req.body;

        const { score, severity } = calculateRiskMatrix(likelihood, impact);

        const newRisk = await Risk.create({
            riskId: riskId || `RSK-${Date.now()}`,
            title,
            category,
            description,
            likelihood,
            impact,
            riskScore: score,
            severity,
            affectedAsset,
            owner: owner || "Security Governance",
            remediation,
            dueDate
        });

        await logAuditTrail({
            req,
            action: "POLICY_UPDATE",
            fieldsAccessed: ["riskScore", "severity", "title"],
            sensitivityLevel: "Confidential",
            status: "SUCCESS"
        });

        res.status(201).json(newRisk);
    } catch (error) {
        console.error("Create Risk Error:", error);
        res.status(500).json({ message: "Server error creating risk", error: error.message });
    }
};

// @desc    Update existing Risk record
// @route   PUT /api/risks/:id
// @access  Private (SUPER_ADMIN, SECURITY_AUDITOR)
const updateRisk = async (req, res) => {
    try {
        const risk = await Risk.findById(req.params.id);
        if (!risk) return res.status(404).json({ message: "Risk record not found" });

        const { likelihood, impact, status, owner, remediation, dueDate } = req.body;

        if (likelihood) risk.likelihood = likelihood;
        if (impact) risk.impact = impact;
        if (status) risk.status = status;
        if (owner) risk.owner = owner;
        if (remediation) risk.remediation = remediation;
        if (dueDate) risk.dueDate = dueDate;

        const { score, severity } = calculateRiskMatrix(risk.likelihood, risk.impact);
        risk.riskScore = score;
        risk.severity = severity;

        await risk.save();

        res.json(risk);
    } catch (error) {
        console.error("Update Risk Error:", error);
        res.status(500).json({ message: "Server error updating risk", error: error.message });
    }
};

module.exports = {
    getRisks,
    createRisk,
    updateRisk
};
