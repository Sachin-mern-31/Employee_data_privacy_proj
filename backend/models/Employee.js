const mongoose = require("mongoose");
const { encrypt, decrypt, isEncrypted } = require("../services/cryptoService");

const employeeSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        department: {
            type: String,
            required: true
        },
        designation: {
            type: String,
            required: true
        },
        phone: {
            type: String
        },
        joiningDate: {
            type: Date
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "TERMINATED", "ARCHIVED"],
            default: "ACTIVE"
        },
        managerName: {
            type: String
        },
        // Confidential Fields
        address: {
            type: String
        },
        emergencyContact: {
            type: String
        },
        performanceRating: {
            type: String
        },
        // Restricted Sensitive Fields (Encrypted at rest using AES-256)
        ssn: {
            type: String // Aadhar / SSN encrypted
        },
        salary: {
            type: String // Encrypted string
        },
        bankDetails: {
            type: String // Encrypted string
        },
        healthInfo: {
            type: String // Encrypted string
        },
        // Compliance & Retention
        isArchived: {
            type: Boolean,
            default: false
        },
        retentionFlagged: {
            type: Boolean,
            default: false
        },
        retentionFlaggedReason: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Pre-save hook to ensure sensitive fields are encrypted at rest
employeeSchema.pre("save", function (next) {
    const sensitiveFields = ["ssn", "salary", "bankDetails", "healthInfo"];
    for (const field of sensitiveFields) {
        if (this[field] && !isEncrypted(this[field])) {
            this[field] = encrypt(this[field]);
        }
    }
    next();
});

// Helper method to obtain a clean representation with optional decryption of restricted fields
employeeSchema.methods.toAuditedJSON = function (options = {}) {
    const { includeRestricted = false } = options;
    const doc = this.toObject();

    if (includeRestricted) {
        doc.ssn = decrypt(doc.ssn);
        doc.salary = decrypt(doc.salary);
        doc.bankDetails = decrypt(doc.bankDetails);
        doc.healthInfo = decrypt(doc.healthInfo);
        doc.isDecryptedView = true;
    } else {
        // Mask restricted fields if not explicitly requested/authorized
        doc.ssn = doc.ssn ? "••••••••••••" : null;
        doc.salary = doc.salary ? "••••••••" : null;
        doc.bankDetails = doc.bankDetails ? "••••••••••••" : null;
        doc.healthInfo = doc.healthInfo ? "••••••••" : null;
        doc.isDecryptedView = false;
    }

    return doc;
};

module.exports = mongoose.model("Employee", employeeSchema);