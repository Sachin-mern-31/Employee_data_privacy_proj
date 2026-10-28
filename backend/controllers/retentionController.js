const RetentionPolicy = require("../models/RetentionPolicy");
const Employee = require("../models/Employee");
const { logAuditTrail } = require("../middleware/auditMiddleware");

// @desc    Get retention policy settings & flagged records
// @route   GET /api/retention
// @access  Private (SUPER_ADMIN)
const getRetentionStatus = async (req, res) => {
    try {
        let policy = await RetentionPolicy.findOne();
        if (!policy) {
            policy = await RetentionPolicy.create({
                retentionPeriodDays: 365,
                autoFlagInactive: true,
                anomalyThresholdPerHour: 10
            });
        }

        const flaggedEmployees = await Employee.find({
            $or: [{ retentionFlagged: true }, { status: "TERMINATED" }]
        });

        res.json({
            policy,
            flaggedCount: flaggedEmployees.length,
            flaggedEmployees: flaggedEmployees.map(e => e.toAuditedJSON({ includeRestricted: false }))
        });
    } catch (error) {
        console.error("Get Retention Status Error:", error);
        res.status(500).json({ message: "Server error fetching retention policy", error: error.message });
    }
};

// @desc    Update retention policy configuration
// @route   PUT /api/retention/policy
// @access  Private (SUPER_ADMIN)
const updateRetentionPolicy = async (req, res) => {
    try {
        const { retentionPeriodDays, anomalyThresholdPerHour } = req.body;

        let policy = await RetentionPolicy.findOne();
        if (!policy) {
            policy = new RetentionPolicy();
        }

        if (retentionPeriodDays) policy.retentionPeriodDays = retentionPeriodDays;
        if (anomalyThresholdPerHour) policy.anomalyThresholdPerHour = anomalyThresholdPerHour;
        policy.updatedBy = req.user.email;

        await policy.save();

        await logAuditTrail({
            req,
            action: "POLICY_UPDATE",
            fieldsAccessed: ["retentionPeriodDays", "anomalyThresholdPerHour"],
            sensitivityLevel: "Confidential",
            status: "SUCCESS"
        });

        res.json(policy);
    } catch (error) {
        res.status(500).json({ message: "Server error updating retention policy", error: error.message });
    }
};

// @desc    Run automated retention scan to flag old/inactive employee records
// @route   POST /api/retention/scan
// @access  Private (SUPER_ADMIN)
const runRetentionScan = async (req, res) => {
    try {
        const policy = (await RetentionPolicy.findOne()) || { retentionPeriodDays: 365 };
        const cutoffDate = new Date(Date.now() - policy.retentionPeriodDays * 24 * 60 * 60 * 1000);

        // Find employees created or updated before cutoffDate AND (INACTIVE or TERMINATED)
        const candidates = await Employee.find({
            status: { $in: ["INACTIVE", "TERMINATED"] },
            updatedAt: { $lte: cutoffDate }
        });

        for (const emp of candidates) {
            emp.retentionFlagged = true;
            emp.retentionFlaggedReason = `Inactive record exceeded retention limit of ${policy.retentionPeriodDays} days.`;
            await emp.save();
        }

        await logAuditTrail({
            req,
            action: "POLICY_UPDATE",
            fieldsAccessed: ["retentionScan"],
            sensitivityLevel: "Confidential",
            status: "SUCCESS"
        });

        res.json({
            message: `Retention scan completed. ${candidates.length} records flagged for archival/deletion review.`,
            flaggedCount: candidates.length
        });
    } catch (error) {
        console.error("Retention Scan Error:", error);
        res.status(500).json({ message: "Server error running retention scan", error: error.message });
    }
};

// @desc    Approve archival or deletion for flagged retention records
// @route   POST /api/retention/approve
// @access  Private (SUPER_ADMIN)
const approveRetentionAction = async (req, res) => {
    try {
        const { employeeId, action = "ARCHIVE" } = req.body;

        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({ message: "Employee record not found" });
        }

        if (action === "DELETE") {
            await Employee.deleteOne({ employeeId });
            await logAuditTrail({
                req,
                action: "DELETE_EMPLOYEE",
                targetEmployeeId: employeeId,
                targetEmployeeName: employee.name,
                fieldsAccessed: ["ALL"],
                sensitivityLevel: "Restricted",
                status: "SUCCESS",
                anomalyReason: "Data Retention Policy Compliance Deletion"
            });
            return res.json({ message: `Employee ${employeeId} permanently deleted under Data Minimization rules.` });
        } else {
            employee.status = "ARCHIVED";
            employee.isArchived = true;
            employee.retentionFlagged = false;
            await employee.save();

            await logAuditTrail({
                req,
                action: "ARCHIVE_RECORD",
                targetEmployeeId: employeeId,
                targetEmployeeName: employee.name,
                fieldsAccessed: ["status", "isArchived"],
                sensitivityLevel: "Confidential",
                status: "SUCCESS"
            });

            return res.json({ message: `Employee ${employeeId} archived successfully.` });
        }
    } catch (error) {
        console.error("Approve Retention Error:", error);
        res.status(500).json({ message: "Server error executing retention approval", error: error.message });
    }
};

module.exports = {
    getRetentionStatus,
    updateRetentionPolicy,
    runRetentionScan,
    approveRetentionAction
};
