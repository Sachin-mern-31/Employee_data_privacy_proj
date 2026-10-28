const mongoose = require("mongoose");

const privacyControlSchema = new mongoose.Schema(
    {
        controlId: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        category: {
            type: String,
            enum: [
                "Data Minimization",
                "Consent Management",
                "Data Retention",
                "Access Transparency",
                "PII Masking"
            ],
            default: "Data Minimization"
        },
        isEnabled: {
            type: Boolean,
            default: true
        },
        complianceStandard: {
            type: String,
            default: "DPDP / GDPR Framework"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("PrivacyControl", privacyControlSchema);
