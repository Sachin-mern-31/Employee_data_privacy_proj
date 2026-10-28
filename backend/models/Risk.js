const mongoose = require("mongoose");

const riskSchema = new mongoose.Schema(
    {
        riskId: {
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
        category: {
            type: String,
            enum: [
                "Access Control",
                "Authentication",
                "Data Protection",
                "Privacy",
                "Account Management",
                "Data Retention",
                "System Configuration"
            ],
            required: true
        },
        description: {
            type: String,
            required: true
        },
        severity: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            default: "MEDIUM"
        },
        likelihood: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            required: true
        },
        impact: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            required: true
        },
        riskScore: {
            type: Number,
            required: true // calculated based on likelihood (1-3) x impact (1-3) -> 1 to 9 scale or normalized 1 to 25
        },
        affectedAsset: {
            type: String,
            required: true
        },
        owner: {
            type: String,
            required: true,
            default: "Security Team"
        },
        status: {
            type: String,
            enum: ["OPEN", "MITIGATING", "RESOLVED", "ACCEPTED"],
            default: "OPEN"
        },
        dueDate: {
            type: Date
        },
        remediation: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

riskSchema.index({ severity: 1, status: 1 });

module.exports = mongoose.model("Risk", riskSchema);
