const mongoose = require("mongoose");

const findingSchema = new mongoose.Schema(
    {
        findingId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        auditType: {
            type: String,
            enum: ["PRIVACY", "SECURITY"],
            required: true
        },
        category: {
            type: String,
            enum: [
                "Access Control",
                "Authentication",
                "Data Protection",
                "Privacy",
                "Account Management",
                "Data Retention",
                "Consent Compliance"
            ],
            required: true
        },
        severity: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            required: true
        },
        riskScore: {
            type: Number,
            default: 5.0
        },
        affectedResource: {
            type: String,
            required: true
        },
        detectedDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ["OPEN", "INVESTIGATING", "REMEDIATION_IN_PROGRESS", "RESOLVED", "RISK_ACCEPTED"],
            default: "OPEN"
        },
        recommendation: {
            type: String,
            required: true
        },
        evidence: {
            type: String
        },
        assignedOwner: {
            type: String,
            default: "Unassigned"
        },
        dueDate: {
            type: Date
        },
        resolutionDate: {
            type: Date
        },
        remediationNotes: {
            type: String
        },
        remediationHistory: [
            {
                updatedBy: String,
                previousStatus: String,
                newStatus: String,
                note: String,
                timestamp: { type: Date, default: Date.now }
            }
        ]
    },
    {
        timestamps: true
    }
);

findingSchema.index({ auditType: 1, status: 1 });
findingSchema.index({ severity: 1 });

module.exports = mongoose.model("Finding", findingSchema);
