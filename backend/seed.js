const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");
const Employee = require("./models/Employee");
const AuditLog = require("./models/AuditLog");
const ConsentRecord = require("./models/ConsentRecord");
const RetentionPolicy = require("./models/RetentionPolicy");
const Finding = require("./models/Finding");
const Risk = require("./models/Risk");
const SecurityAlert = require("./models/SecurityAlert");
const PrivacyControl = require("./models/PrivacyControl");

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        console.log("🧹 Clearing existing collection data...");
        await User.deleteMany();
        await Employee.deleteMany();
        await AuditLog.deleteMany();
        await ConsentRecord.deleteMany();
        await RetentionPolicy.deleteMany();
        await Finding.deleteMany();
        await Risk.deleteMany();
        await SecurityAlert.deleteMany();
        await PrivacyControl.deleteMany();

        console.log("🌱 Seeding System Users with Granular Roles...");
        
        // Super Admin User
        const adminUser = await User.create({
            name: "Eleanor Vance",
            email: "admin@hrshield.com",
            password: "AdminPassword123!",
            role: "SUPER_ADMIN",
            department: "Executive Security"
        });

        // HR Manager User
        const hrUser = await User.create({
            name: "Sarah Jenkins",
            email: "hr@hrshield.com",
            password: "ManagerPassword123!",
            role: "HR_MANAGER",
            department: "Human Resources"
        });

        // Security Auditor User
        const auditorUser = await User.create({
            name: "Marcus Vance",
            email: "auditor@hrshield.com",
            password: "AuditorPassword123!",
            role: "SECURITY_AUDITOR",
            department: "Cyber Governance & Audit"
        });

        // HR Staff User
        const staffUser = await User.create({
            name: "Emily Watson",
            email: "staff@hrshield.com",
            password: "StaffPassword123!",
            role: "HR_STAFF",
            department: "Human Resources"
        });

        // Standard Employee User
        const employeeUser = await User.create({
            name: "John Doe",
            email: "john@hrshield.com",
            password: "EmployeePassword123!",
            role: "EMPLOYEE",
            employeeId: "EMP001",
            department: "Engineering"
        });

        console.log("🌱 Seeding Sample Employees with AES-256 Encrypted PII...");
        
        const employees = [
            {
                employeeId: "EMP001",
                name: "John Doe",
                email: "john@hrshield.com",
                department: "Engineering",
                designation: "Principal Software Engineer",
                phone: "+1 (555) 234-5678",
                joiningDate: new Date("2022-03-15"),
                status: "ACTIVE",
                managerName: "Alex Mercer",
                address: "742 Evergreen Terrace, Springfield, OR",
                emergencyContact: "+1 (555) 987-6543 (Wife - Jane)",
                performanceRating: "Exceeds Expectations (4.8/5.0)",
                ssn: "987-65-4321", // Will be encrypted by pre-save hook
                salary: "$145,000 / year",
                bankDetails: "Chase Bank - Acct: 489201938, Routing: 021000021",
                healthInfo: "Blood Type: O+, Severe Peanut Allergy"
            },
            {
                employeeId: "EMP002",
                name: "Sarah Jenkins",
                email: "hr@hrshield.com",
                department: "Human Resources",
                designation: "Senior HR Business Partner",
                phone: "+1 (555) 345-6789",
                joiningDate: new Date("2021-06-01"),
                status: "ACTIVE",
                managerName: "Eleanor Vance",
                address: "100 Bay State Rd, Boston, MA",
                emergencyContact: "+1 (555) 876-5432 (Brother - Tom)",
                performanceRating: "Outstanding (4.9/5.0)",
                ssn: "876-54-3210",
                salary: "$120,000 / year",
                bankDetails: "Bank of America - Acct: 778192041, Routing: 011000138",
                healthInfo: "Blood Type: A-, No chronic conditions"
            },
            {
                employeeId: "EMP003",
                name: "Michael Chen",
                email: "michael.chen@hrshield.com",
                department: "Finance",
                designation: "Lead Financial Analyst",
                phone: "+1 (555) 456-7890",
                joiningDate: new Date("2023-01-10"),
                status: "ACTIVE",
                managerName: "Robert Taylor",
                address: "450 Sutter St, San Francisco, CA",
                emergencyContact: "+1 (555) 765-4321 (Spouse - Lisa)",
                performanceRating: "Meets Expectations (4.2/5.0)",
                ssn: "765-43-2109",
                salary: "$130,000 / year",
                bankDetails: "Wells Fargo - Acct: 990182743, Routing: 121000248",
                healthInfo: "Asthma inhaler required"
            },
            {
                employeeId: "EMP004",
                name: "Priya Sharma",
                email: "priya.sharma@hrshield.com",
                department: "Design",
                designation: "Senior UX Designer",
                phone: "+1 (555) 567-8901",
                joiningDate: new Date("2023-08-20"),
                status: "ACTIVE",
                managerName: "Sarah Jenkins",
                address: "350 Fifth Ave, New York, NY",
                emergencyContact: "+1 (555) 654-3210 (Mother - Sunita)",
                performanceRating: "Exceeds Expectations (4.7/5.0)",
                ssn: "654-32-1098",
                salary: "$115,000 / year",
                bankDetails: "Citi Bank - Acct: 334918204, Routing: 021000089",
                healthInfo: "Blood Type: B+, Penicillin Allergy"
            },
            {
                employeeId: "EMP005",
                name: "David Miller",
                email: "david.miller@hrshield.com",
                department: "Infrastructure",
                designation: "DevOps Engineer (Former)",
                phone: "+1 (555) 678-9012",
                joiningDate: new Date("2020-02-15"),
                status: "TERMINATED",
                managerName: "Alex Mercer",
                address: "1200 Market St, Seattle, WA",
                emergencyContact: "+1 (555) 543-2109",
                performanceRating: "Needs Improvement (2.9/5.0)",
                ssn: "543-21-0987",
                salary: "$110,000 / year",
                bankDetails: "Capital One - Acct: 556718293, Routing: 056008849",
                healthInfo: "No records on file",
                retentionFlagged: true,
                retentionFlaggedReason: "Terminated employee record exceeded 365-day retention threshold."
            }
        ];

        for (const empData of employees) {
            const emp = new Employee(empData);
            await emp.save();
        }

        console.log("🌱 Seeding DPDP Consent Records...");
        await ConsentRecord.create([
            {
                employeeId: "EMP001",
                employeeEmail: "john@hrshield.com",
                purpose: "PAYROLL_VENDOR_SHARING",
                purposeTitle: "Third-Party Payroll Processing Vendor",
                granted: true,
                grantedAt: new Date()
            },
            {
                employeeId: "EMP001",
                employeeEmail: "john@hrshield.com",
                purpose: "HEALTH_INSURANCE_PROVIDER",
                purposeTitle: "Corporate Health & Life Insurance Provider",
                granted: false,
                revokedAt: new Date(),
                notes: "Employee opted out of external health insurance sharing."
            },
            {
                employeeId: "EMP001",
                employeeEmail: "john@hrshield.com",
                purpose: "BACKGROUND_CHECK_AGENCY",
                purposeTitle: "External Background Verification Agency",
                granted: true
            },
            {
                employeeId: "EMP001",
                employeeEmail: "john@hrshield.com",
                purpose: "THIRD_PARTY_ANALYTICS",
                purposeTitle: "Internal Workforce Analytics & Survey Tools",
                granted: true
            }
        ]);

        console.log("🌱 Seeding Global Retention Policy...");
        await RetentionPolicy.create({
            policyName: "Enterprise Employee Data Retention Policy 2026",
            retentionPeriodDays: 365,
            autoFlagInactive: true,
            anomalyThresholdPerHour: 10,
            updatedBy: "admin@hrshield.com"
        });

        console.log("🌱 Seeding Audit Findings & Remediation Records...");
        await Finding.create([
            {
                findingId: "FND-SEC-101",
                title: "Excessive Sensitive Field Velocity Anomaly",
                description: "HR Manager account accessed 12 restricted SSN/Salary fields within 60 minutes, breaching velocity threshold of 10 accesses/hr.",
                auditType: "SECURITY",
                category: "Access Control",
                severity: "HIGH",
                riskScore: 8.0,
                affectedResource: "Employee Financial PII API",
                status: "REMEDIATION_IN_PROGRESS",
                recommendation: "Enforce multi-factor verification for bulk decrypted reads and review user access log history.",
                evidence: "12 log entries from IP 192.168.1.45 within timestamp window 09:00-10:00 UTC.",
                assignedOwner: "Marcus Vance (Auditor)",
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                remediationNotes: "Under investigation with HR Lead to confirm quarterly audit justification."
            },
            {
                findingId: "FND-PRV-102",
                title: "Terminated Employee Exceeds Retention Policy Window",
                description: "Record EMP005 (David Miller) terminated over 365 days ago remains stored without archival or anonymization tag.",
                auditType: "PRIVACY",
                category: "Data Retention",
                severity: "HIGH",
                riskScore: 7.5,
                affectedResource: "Employee DB (EMP005)",
                status: "OPEN",
                recommendation: "Archive record into cold storage or execute legal retention anonymization process.",
                evidence: "Termination Date: 2024-02-15; Retention Limit: 365 Days.",
                assignedOwner: "Sarah Jenkins (HR Manager)",
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            },
            {
                findingId: "FND-PRV-103",
                title: "Third-Party Payroll Export Consent Violation Risk",
                description: "1 employee record has explicitly revoked third-party health data consent; verification needed prior to automated vendor sync.",
                auditType: "PRIVACY",
                category: "Consent Compliance",
                severity: "MEDIUM",
                riskScore: 5.0,
                affectedResource: "Consent Subsystem",
                status: "RESOLVED",
                recommendation: "Ensure export API automatically redacts PII for employees with revoked consent.",
                evidence: "Consent record consent_ref_002 marked revoked.",
                assignedOwner: "Eleanor Vance (Admin)",
                resolutionDate: new Date(),
                remediationNotes: "Export API updated with auto-redaction check for revoked consent records."
            }
        ]);

        console.log("🌱 Seeding Risk Management Matrix Data...");
        await Risk.create([
            {
                riskId: "RSK-001",
                title: "Unauthorized Exfiltration of Restricted Employee PII",
                category: "Data Protection",
                description: "Attacker obtaining valid credentials could attempt bulk access to unmasked financial/health records.",
                severity: "CRITICAL",
                likelihood: "HIGH",
                impact: "HIGH",
                riskScore: 9,
                affectedAsset: "Employee Database (Mongo Atlas)",
                owner: "Cyber Governance Team",
                status: "MITIGATING",
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                remediation: "Enforce AES-256 field encryption at rest, rate limit restricted views, and enforce anomaly telemetry alerts."
            },
            {
                riskId: "RSK-002",
                title: "Non-Compliance with DPDP Act Consent Regulations",
                category: "Privacy",
                description: "Sharing employee PII with third-party vendors after consent revocation could result in regulatory penalties.",
                severity: "HIGH",
                likelihood: "MEDIUM",
                impact: "HIGH",
                riskScore: 6,
                affectedAsset: "Payroll Export Pipeline",
                owner: "Data Privacy Officer",
                status: "MITIGATING",
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                remediation: "Implement strict server-side consent validation logic before generating vendor export payloads."
            },
            {
                riskId: "RSK-003",
                title: "Stale & Inactive Account Session Hijacking",
                category: "Account Management",
                description: "Orphaned or unmonitored inactive user accounts could be targeted for credential stuffing.",
                severity: "MEDIUM",
                likelihood: "LOW",
                impact: "MEDIUM",
                riskScore: 2,
                affectedAsset: "User Authentication Gateway",
                owner: "IT Operations",
                status: "RESOLVED",
                dueDate: new Date(),
                remediation: "Auto-disable inactive accounts after 90 days of inactivity and require MFA re-authentication."
            }
        ]);

        console.log("🌱 Seeding Active Security Alerts...");
        await SecurityAlert.create([
            {
                alertId: "ALT-2026-001",
                title: "High Velocity Access Anomaly Flagged",
                description: "User hr@hrshield.com accessed 12 restricted fields within 60 minutes.",
                severity: "HIGH",
                category: "Access Control",
                source: "Telemetry Service"
            },
            {
                alertId: "ALT-2026-002",
                title: "Terminated Record Overdue For Retention Action",
                description: "Employee EMP005 record exceeds 365-day retention threshold.",
                severity: "HIGH",
                category: "Data Retention",
                source: "Audit Engine"
            },
            {
                alertId: "ALT-2026-003",
                title: "Third-Party Consent Revoked",
                description: "Employee John Doe revoked HEALTH_INSURANCE_PROVIDER consent.",
                severity: "MEDIUM",
                category: "Privacy Control",
                source: "Consent Portal"
            }
        ]);

        console.log("🌱 Seeding Initial Telemetry Audit Logs...");
        const sampleLogs = [
            {
                userId: hrUser._id,
                userName: hrUser.name,
                userEmail: hrUser.email,
                userRole: hrUser.role,
                action: "READ_SENSITIVE",
                targetEmployeeId: "EMP001",
                targetEmployeeName: "John Doe",
                fieldsAccessed: ["ssn", "salary", "bankDetails"],
                sensitivityLevel: "Restricted",
                ipAddress: "192.168.1.45",
                userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                status: "SUCCESS",
                anomalyFlagged: false
            },
            {
                userId: hrUser._id,
                userName: hrUser.name,
                userEmail: hrUser.email,
                userRole: hrUser.role,
                action: "READ_SENSITIVE",
                targetEmployeeId: "EMP004",
                targetEmployeeName: "Priya Sharma",
                fieldsAccessed: ["ssn", "salary", "bankDetails", "healthInfo"],
                sensitivityLevel: "Restricted",
                ipAddress: "192.168.1.45",
                userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                status: "FLAGGED",
                anomalyFlagged: true,
                anomalyReason: "High volume anomaly: 12 sensitive field accesses in 1 hour (Threshold: 10)"
            },
            {
                userId: employeeUser._id,
                userName: employeeUser.name,
                userEmail: employeeUser.email,
                userRole: employeeUser.role,
                action: "TOGGLE_CONSENT",
                targetEmployeeId: "EMP001",
                targetEmployeeName: "John Doe",
                fieldsAccessed: ["HEALTH_INSURANCE_PROVIDER"],
                sensitivityLevel: "Confidential",
                ipAddress: "172.16.0.12",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                status: "SUCCESS",
                anomalyFlagged: false
            },
            {
                userId: adminUser._id,
                userName: adminUser.name,
                userEmail: adminUser.email,
                userRole: adminUser.role,
                action: "POLICY_UPDATE",
                fieldsAccessed: ["retentionPeriodDays"],
                sensitivityLevel: "Confidential",
                ipAddress: "10.0.0.1",
                userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
                status: "SUCCESS",
                anomalyFlagged: false
            }
        ];

        await AuditLog.insertMany(sampleLogs);

        console.log("✅ Seed completed successfully!");
        console.log("-----------------------------------------");
        console.log("🔑 DEMO LOGIN CREDENTIALS:");
        console.log("1. Super Admin:       admin@hrshield.com / AdminPassword123!");
        console.log("2. Security Auditor:  auditor@hrshield.com / AuditorPassword123!");
        console.log("3. HR Manager:        hr@hrshield.com / ManagerPassword123!");
        console.log("4. HR Staff:          staff@hrshield.com / StaffPassword123!");
        console.log("5. Employee:          john@hrshield.com / EmployeePassword123!");
        console.log("-----------------------------------------");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedData();
