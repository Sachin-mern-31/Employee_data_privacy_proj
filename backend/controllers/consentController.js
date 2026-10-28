const ConsentRecord = require("../models/ConsentRecord");
const Employee = require("../models/Employee");
const { logAuditTrail } = require("../middleware/auditMiddleware");

const PURPOSES = [
    {
        key: "PAYROLL_VENDOR_SHARING",
        title: "Third-Party Payroll Processing Vendor",
        description: "Share salary, bank account details, and tax identifiers for automated monthly payroll processing."
    },
    {
        key: "HEALTH_INSURANCE_PROVIDER",
        title: "Corporate Health & Life Insurance Provider",
        description: "Share employee health disclosures and emergency contacts with corporate insurance underwriters."
    },
    {
        key: "BACKGROUND_CHECK_AGENCY",
        title: "External Background Verification Agency",
        description: "Share identity documents and employment history for mandatory periodic compliance verifications."
    },
    {
        key: "THIRD_PARTY_ANALYTICS",
        title: "Internal Workforce Analytics & Survey Tools",
        description: "Share anonymized performance and department metrics with third-party HR optimization tools."
    }
];

// @desc    Get consent settings for current logged-in employee (or specified employee)
// @route   GET /api/consent
// @access  Private
const getConsents = async (req, res) => {
    try {
        let employeeId = req.user.employeeId;

        // HR Manager or Super Admin can query for any employee by query param
        if (req.query.employeeId && (req.user.role === "SUPER_ADMIN" || req.user.role === "HR_MANAGER")) {
            employeeId = req.query.employeeId;
        }

        if (!employeeId) {
            return res.json([]);
        }

        let existingRecords = await ConsentRecord.find({ employeeId });

        // Ensure default entries exist for all 4 purposes
        const recordMap = new Map();
        existingRecords.forEach(r => recordMap.set(r.purpose, r));

        const formattedConsents = PURPOSES.map(p => {
            const record = recordMap.get(p.key);
            return {
                purpose: p.key,
                purposeTitle: p.title,
                description: p.description,
                granted: record ? record.granted : true, // Default to true if not explicitly set
                grantedAt: record ? record.grantedAt : null,
                revokedAt: record ? record.revokedAt : null,
                employeeId
            };
        });

        res.json(formattedConsents);
    } catch (error) {
        console.error("Get Consents Error:", error);
        res.status(500).json({ message: "Server error fetching consent records", error: error.message });
    }
};

// @desc    Toggle/Update consent status for a specific data usage purpose
// @route   PUT /api/consent
// @access  Private (Employee for own, or Super Admin)
const updateConsent = async (req, res) => {
    try {
        const { purpose, granted, notes } = req.body;
        let employeeId = req.user.employeeId;

        if (!purpose) {
            return res.status(400).json({ message: "Data processing purpose is required" });
        }

        const purposeObj = PURPOSES.find(p => p.key === purpose);
        const purposeTitle = purposeObj ? purposeObj.title : purpose;

        let consentRecord = await ConsentRecord.findOne({ employeeId, purpose });

        if (consentRecord) {
            consentRecord.granted = granted;
            if (granted) {
                consentRecord.grantedAt = new Date();
                consentRecord.revokedAt = null;
            } else {
                consentRecord.revokedAt = new Date();
            }
            consentRecord.notes = notes || consentRecord.notes;
            await consentRecord.save();
        } else {
            consentRecord = await ConsentRecord.create({
                employeeId,
                employeeEmail: req.user.email,
                purpose,
                purposeTitle,
                granted,
                grantedAt: granted ? new Date() : null,
                revokedAt: granted ? null : new Date(),
                notes
            });
        }

        // Log audit event for DPDP consent change
        await logAuditTrail({
            req,
            action: "TOGGLE_CONSENT",
            targetEmployeeId: employeeId,
            fieldsAccessed: [purpose],
            sensitivityLevel: "Confidential",
            status: "SUCCESS",
            anomalyReason: granted ? null : `Consent revoked for ${purpose}`
        });

        res.json(consentRecord);
    } catch (error) {
        console.error("Update Consent Error:", error);
        res.status(500).json({ message: "Server error updating consent setting", error: error.message });
    }
};

// @desc    Get all consent summary records across organization
// @route   GET /api/consent/all
// @access  Private (SUPER_ADMIN, HR_MANAGER)
const getAllConsents = async (req, res) => {
    try {
        const consents = await ConsentRecord.find().sort({ updatedAt: -1 });
        res.json(consents);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching all consents", error: error.message });
    }
};

module.exports = {
    getConsents,
    updateConsent,
    getAllConsents
};
