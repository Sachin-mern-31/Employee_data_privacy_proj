const User = require("../models/User");
const Employee = require("../models/Employee");
const { logAuditTrail } = require("../middleware/auditMiddleware");

// @desc    Get all system users
// @route   GET /api/users
// @access  Private (SUPER_ADMIN)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ message: "Server error fetching users", error: error.message });
    }
};

// @desc    Update user role or active status
// @route   PUT /api/users/:id
// @access  Private (SUPER_ADMIN)
const updateUser = async (req, res) => {
    try {
        const { role, isActive, department } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (role) user.role = role;
        if (typeof isActive === "boolean") user.isActive = isActive;
        if (department) user.department = department;

        await user.save();

        await logAuditTrail({
            req,
            action: "POLICY_UPDATE",
            fieldsAccessed: ["userRole", "isActive", "department"],
            sensitivityLevel: "Confidential",
            status: "SUCCESS"
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            isActive: user.isActive,
            employeeId: user.employeeId
        });
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ message: "Server error updating user", error: error.message });
    }
};

// @desc    Get Role-Based Access Control (RBAC) Permission Matrix
// @route   GET /api/users/rbac-matrix
// @access  Private
const getRBACMatrix = async (req, res) => {
    const matrix = [
        {
            permission: "View Employee Directory",
            SUPER_ADMIN: "Full",
            HR_MANAGER: "Full",
            HR_STAFF: "Limited",
            SECURITY_AUDITOR: "Audit View",
            EMPLOYEE: "Own Profile Only"
        },
        {
            permission: "Edit Employee PII",
            SUPER_ADMIN: "Full",
            HR_MANAGER: "Full",
            HR_STAFF: "Non-Sensitive",
            SECURITY_AUDITOR: "None",
            EMPLOYEE: "Own Contact Info"
        },
        {
            permission: "View Masked Financials (Salary/Bank)",
            SUPER_ADMIN: "Authorized Decrypt",
            HR_MANAGER: "Authorized Decrypt",
            HR_STAFF: "Masked Only",
            SECURITY_AUDITOR: "Audit Decrypt Logged",
            EMPLOYEE: "Own Financials"
        },
        {
            permission: "Run Privacy & Security Audits",
            SUPER_ADMIN: "Full",
            HR_MANAGER: "Full",
            HR_STAFF: "None",
            SECURITY_AUDITOR: "Full",
            EMPLOYEE: "None"
        },
        {
            permission: "View System Telemetry & Logs",
            SUPER_ADMIN: "Full",
            HR_MANAGER: "Limited",
            HR_STAFF: "None",
            SECURITY_AUDITOR: "Full",
            EMPLOYEE: "None"
        },
        {
            permission: "Remediate Findings & Update Risks",
            SUPER_ADMIN: "Full",
            HR_MANAGER: "Assigned Only",
            HR_STAFF: "None",
            SECURITY_AUDITOR: "Full",
            EMPLOYEE: "None"
        },
        {
            permission: "Manage User Accounts & Roles",
            SUPER_ADMIN: "Full",
            HR_MANAGER: "None",
            HR_STAFF: "None",
            SECURITY_AUDITOR: "None",
            EMPLOYEE: "None"
        }
    ];

    res.json(matrix);
};

module.exports = {
    getUsers,
    updateUser,
    getRBACMatrix
};
