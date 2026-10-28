const mongoose = require("mongoose");

const consentRecordSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true,
            trim: true
        },
        employeeEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        purpose: {
            type: String,
            required: true,
            enum: [
                "PAYROLL_VENDOR_SHARING",
                "HEALTH_INSURANCE_PROVIDER",
                "BACKGROUND_CHECK_AGENCY",
                "THIRD_PARTY_ANALYTICS"
            ]
        },
        purposeTitle: {
            type: String,
            required: true
        },
        granted: {
            type: Boolean,
            default: true
        },
        grantedAt: {
            type: Date,
            default: Date.now
        },
        revokedAt: {
            type: Date
        },
        notes: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Unique compound index so one employee has 1 record per purpose
consentRecordSchema.index({ employeeId: 1, purpose: 1 }, { unique: true });

module.exports = mongoose.model("ConsentRecord", consentRecordSchema);
