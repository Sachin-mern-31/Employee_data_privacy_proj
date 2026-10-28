const mongoose = require("mongoose");

const securityAlertSchema = new mongoose.Schema(
    {
        alertId: {
            type: String,
            required: true,
            unique: true
        },
        title: {
            type: String,
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
        category: {
            type: String,
            default: "Security Event"
        },
        source: {
            type: String,
            default: "Audit Engine"
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("SecurityAlert", securityAlertSchema);
