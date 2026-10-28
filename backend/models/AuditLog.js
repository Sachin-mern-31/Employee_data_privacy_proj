const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        userName: {
            type: String
        },
        userEmail: {
            type: String
        },
        userRole: {
            type: String,
            required: true
        },
        action: {
            type: String,
            required: true,
            enum: [
                "READ_GENERAL",
                "READ_SENSITIVE",
                "CREATE_EMPLOYEE",
                "UPDATE_EMPLOYEE",
                "DELETE_EMPLOYEE",
                "EXPORT_DATA",
                "TOGGLE_CONSENT",
                "ARCHIVE_RECORD",
                "POLICY_UPDATE",
                "LOGIN_SUCCESS",
                "LOGIN_FAILED"
            ]
        },
        targetEmployeeId: {
            type: String
        },
        targetEmployeeName: {
            type: String
        },
        fieldsAccessed: [
            {
                type: String
            }
        ],
        sensitivityLevel: {
            type: String,
            enum: ["Public", "Internal", "Confidential", "Restricted"],
            default: "Public"
        },
        ipAddress: {
            type: String,
            default: "127.0.0.1"
        },
        userAgent: {
            type: String
        },
        status: {
            type: String,
            enum: ["SUCCESS", "DENIED", "FLAGGED"],
            default: "SUCCESS"
        },
        anomalyFlagged: {
            type: Boolean,
            default: false
        },
        anomalyReason: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Index for fast querying by timestamp and user
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ anomalyFlagged: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);