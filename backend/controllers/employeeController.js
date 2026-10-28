const Employee = require("../models/Employee");
const ConsentRecord = require("../models/ConsentRecord");
const { logAuditTrail } = require("../middleware/auditMiddleware");

// @desc    Get all employees (masked by default for security)
// @route   GET /api/employees
// @access  Private (SUPER_ADMIN, HR_MANAGER)
const getEmployees = async (req, res) => {
    try {
        const { search, department, status } = req.query;
        let query = { isArchived: { $ne: true } };

        // If user is EMPLOYEE, only return their own employee profile
        if (req.user.role === "EMPLOYEE") {
            if (req.user.employeeId) {
                query.employeeId = req.user.employeeId;
            } else {
                return res.json([]);
            }
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { employeeId: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { designation: { $regex: search, $options: "i" } }
            ];
        }

        if (department) {
            query.department = department;
        }

        if (status) {
            query.status = status;
        }

        const employees = await Employee.find(query).sort({ createdAt: -1 });

        // Log audit event for bulk read
        await logAuditTrail({
            req,
            action: "READ_GENERAL",
            fieldsAccessed: ["name", "department", "designation", "email"],
            sensitivityLevel: "Public"
        });

        // Format response with masked restricted fields
        const formattedEmployees = employees.map(emp => emp.toAuditedJSON({ includeRestricted: false }));

        res.json(formattedEmployees);
    } catch (error) {
        console.error("Get Employees Error:", error);
        res.status(500).json({ message: "Server error fetching employees", error: error.message });
    }
};

// @desc    Get single employee details (with optional decrypt trigger)
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
    try {
        const { revealSensitive } = req.query;
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: "Employee record not found" });
        }

        // Permission check for Employee role
        if (req.user.role === "EMPLOYEE" && req.user.employeeId !== employee.employeeId) {
            await logAuditTrail({
                req,
                action: "READ_SENSITIVE",
                targetEmployeeId: employee.employeeId,
                targetEmployeeName: employee.name,
                sensitivityLevel: "Restricted",
                status: "DENIED",
                anomalyReason: "Unauthorized employee attempted to view another employee profile"
            });
            return res.status(403).json({ message: "Unauthorized: You can only view your own profile." });
        }

        const shouldDecrypt = revealSensitive === "true";

        // Record audit trail if sensitive data decrypted
        if (shouldDecrypt) {
            const sensitiveFields = ["ssn", "salary", "bankDetails", "healthInfo"];
            await logAuditTrail({
                req,
                action: "READ_SENSITIVE",
                targetEmployeeId: employee.employeeId,
                targetEmployeeName: employee.name,
                fieldsAccessed: sensitiveFields,
                sensitivityLevel: "Restricted",
                status: "SUCCESS"
            });
        } else {
            await logAuditTrail({
                req,
                action: "READ_GENERAL",
                targetEmployeeId: employee.employeeId,
                targetEmployeeName: employee.name,
                fieldsAccessed: ["name", "email", "department", "phone", "address"],
                sensitivityLevel: "Confidential",
                status: "SUCCESS"
            });
        }

        res.json(employee.toAuditedJSON({ includeRestricted: shouldDecrypt }));
    } catch (error) {
        console.error("Get Employee Detail Error:", error);
        res.status(500).json({ message: "Server error fetching employee detail", error: error.message });
    }
};

// @desc    Create new employee record
// @route   POST /api/employees
// @access  Private (SUPER_ADMIN, HR_MANAGER)
const createEmployee = async (req, res) => {
    try {
        const {
            employeeId,
            name,
            email,
            department,
            designation,
            phone,
            joiningDate,
            status,
            managerName,
            address,
            emergencyContact,
            performanceRating,
            ssn,
            salary,
            bankDetails,
            healthInfo
        } = req.body;

        const existingEmp = await Employee.findOne({ employeeId });
        if (existingEmp) {
            return res.status(400).json({ message: `Employee ID ${employeeId} already exists.` });
        }

        const employee = new Employee({
            employeeId,
            name,
            email,
            department,
            designation,
            phone,
            joiningDate: joiningDate || new Date(),
            status: status || "ACTIVE",
            managerName,
            address,
            emergencyContact,
            performanceRating,
            ssn,
            salary,
            bankDetails,
            healthInfo
        });

        // Pre-save hook automatically encrypts ssn, salary, bankDetails, healthInfo
        await employee.save();

        await logAuditTrail({
            req,
            action: "CREATE_EMPLOYEE",
            targetEmployeeId: employee.employeeId,
            targetEmployeeName: employee.name,
            fieldsAccessed: Object.keys(req.body),
            sensitivityLevel: "Restricted",
            status: "SUCCESS"
        });

        res.status(201).json(employee.toAuditedJSON({ includeRestricted: false }));
    } catch (error) {
        console.error("Create Employee Error:", error);
        res.status(500).json({ message: "Server error creating employee", error: error.message });
    }
};

// @desc    Update employee record
// @route   PUT /api/employees/:id
// @access  Private (SUPER_ADMIN, HR_MANAGER or EMPLOYEE for own profile)
const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: "Employee record not found" });
        }

        // Role authorization check
        if (req.user.role === "EMPLOYEE") {
            if (req.user.employeeId !== employee.employeeId) {
                return res.status(403).json({ message: "Unauthorized to update this profile" });
            }
            // Employees can only update non-restricted personal fields
            const allowedSelfFields = ["phone", "address", "emergencyContact"];
            for (const key of Object.keys(req.body)) {
                if (!allowedSelfFields.includes(key)) {
                    return res.status(403).json({ message: `Employees cannot update restricted field: ${key}` });
                }
            }
        }

        const updatedFields = Object.keys(req.body);
        let containsRestricted = updatedFields.some(f => ["ssn", "salary", "bankDetails", "healthInfo"].includes(f));

        // Update fields on employee
        Object.assign(employee, req.body);
        await employee.save();

        await logAuditTrail({
            req,
            action: "UPDATE_EMPLOYEE",
            targetEmployeeId: employee.employeeId,
            targetEmployeeName: employee.name,
            fieldsAccessed: updatedFields,
            sensitivityLevel: containsRestricted ? "Restricted" : "Confidential",
            status: "SUCCESS"
        });

        res.json(employee.toAuditedJSON({ includeRestricted: false }));
    } catch (error) {
        console.error("Update Employee Error:", error);
        res.status(500).json({ message: "Server error updating employee", error: error.message });
    }
};

// @desc    Delete employee record
// @route   DELETE /api/employees/:id
// @access  Private (SUPER_ADMIN only)
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: "Employee record not found" });
        }

        await Employee.findByIdAndDelete(req.params.id);

        await logAuditTrail({
            req,
            action: "DELETE_EMPLOYEE",
            targetEmployeeId: employee.employeeId,
            targetEmployeeName: employee.name,
            fieldsAccessed: ["ALL"],
            sensitivityLevel: "Restricted",
            status: "SUCCESS"
        });

        res.json({ message: `Employee record ${employee.employeeId} successfully removed.` });
    } catch (error) {
        console.error("Delete Employee Error:", error);
        res.status(500).json({ message: "Server error deleting employee", error: error.message });
    }
};

// @desc    Export employee data after checking consent preferences (DPDP/GDPR Compliance)
// @route   GET /api/employees/export/data
// @access  Private (SUPER_ADMIN, HR_MANAGER)
const exportEmployeeData = async (req, res) => {
    try {
        const { purpose = "PAYROLL_VENDOR_SHARING" } = req.query;

        const employees = await Employee.find({ isArchived: { $ne: true } });
        const consents = await ConsentRecord.find({ purpose });

        const consentMap = new Map();
        consents.forEach(c => consentMap.set(c.employeeId, c.granted));

        const exportedData = employees.map(emp => {
            const hasConsent = consentMap.has(emp.employeeId) ? consentMap.get(emp.employeeId) : true; // Default true if no record set
            const baseObj = {
                employeeId: emp.employeeId,
                name: emp.name,
                department: emp.department,
                designation: emp.designation,
                consentStatusForPurpose: hasConsent ? "CONSENT_GRANTED" : "CONSENT_REVOKED"
            };

            // If consent is granted, decrypt financial/payroll fields for export; if revoked, redact!
            if (hasConsent) {
                const decryptedEmp = emp.toAuditedJSON({ includeRestricted: true });
                baseObj.salary = decryptedEmp.salary;
                baseObj.bankDetails = decryptedEmp.bankDetails;
            } else {
                baseObj.salary = "[DATA REDACTED - CONSENT REVOKED]";
                baseObj.bankDetails = "[DATA REDACTED - CONSENT REVOKED]";
            }

            return baseObj;
        });

        await logAuditTrail({
            req,
            action: "EXPORT_DATA",
            fieldsAccessed: ["employeeId", "name", "salary", "bankDetails", "consentStatus"],
            sensitivityLevel: "Restricted",
            status: "SUCCESS"
        });

        res.json({
            exportPurpose: purpose,
            totalRecords: exportedData.length,
            recordsWithRevokedConsent: exportedData.filter(d => d.consentStatusForPurpose === "CONSENT_REVOKED").length,
            data: exportedData
        });
    } catch (error) {
        console.error("Export Data Error:", error);
        res.status(500).json({ message: "Server error exporting employee data", error: error.message });
    }
};

module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    exportEmployeeData
};