const mongoose = require("mongoose");

const retentionPolicySchema = new mongoose.Schema(
    {
        policyName: {
            type: String,
            default: "Global Employee Data Retention Policy"
        },
        retentionPeriodDays: {
            type: Number,
            default: 365
        },
        autoFlagInactive: {
            type: Boolean,
            default: true
        },
        anomalyThresholdPerHour: {
            type: Number,
            default: 10
        },
        updatedBy: {
            type: String,
            default: "SUPER_ADMIN"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("RetentionPolicy", retentionPolicySchema);
