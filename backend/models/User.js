const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF", "SECURITY_AUDITOR", "EMPLOYEE"],
            default: "EMPLOYEE"
        },
        department: {
            type: String,
            default: "General"
        },
        employeeRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee"
        },
        employeeId: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        },
        lastLogin: {
            type: Date
        },
        failedLoginAttempts: {
            type: Number,
            default: 0
        },
        lockoutUntil: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Match user password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password before save
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model("User", userSchema);