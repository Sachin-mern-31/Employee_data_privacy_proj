const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const connectDB = require("./config/db");

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Security Headers
app.use(helmet());

// Express Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration
const defaultOrigins = [
    "http://localhost:5173",
    "https://employee-data-privacy-proj.vercel.app"
];
const rawClientUrls = process.env.CLIENT_URL || "";
const allowedOrigins = Array.from(
    new Set([
        ...defaultOrigins,
        ...rawClientUrls
            .split(",")
            .map((url) => url.trim().replace(/\/+$/, ""))
            .filter(Boolean)
    ])
);

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
            if (!origin) return callback(null, true);

            // Allow matching explicit client URL, local dev origins, or any Vercel domain (*.vercel.app)
            const isExplicit = allowedOrigins.includes(origin);
            const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
            const isVercel = /^https:\/\/[a-zA-Z0-9-_.]+\.vercel\.app$/.test(origin);

            if (isExplicit || isLocalhost || isVercel) {
                return callback(null, true);
            }

            // In development, allow for flexibility
            if (process.env.NODE_ENV !== "production") {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
    })
);

// Routes Setup
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const auditRoutes = require("./routes/auditRoutes");
const consentRoutes = require("./routes/consentRoutes");
const retentionRoutes = require("./routes/retentionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const privacyAuditRoutes = require("./routes/privacyAuditRoutes");
const securityRoutes = require("./routes/securityRoutes");
const findingsRoutes = require("./routes/findingsRoutes");
const riskRoutes = require("./routes/riskRoutes");
const alertRoutes = require("./routes/alertRoutes");
const reportRoutes = require("./routes/reportRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/consent", consentRoutes);
app.use("/api/retention", retentionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/privacy", privacyAuditRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/findings", findingsRoutes);
app.use("/api/risks", riskRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);

// Base Health Check Route
app.get("/", (req, res) => {
    res.json({
        system: "HRShield Security Audit & Data Privacy Server",
        status: "ACTIVE",
        timestamp: new Date()
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err : {}
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🔒 HRShield Server running on port ${PORT}`);
});