const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");
const { logAuditTrail } = require("../middleware/auditMiddleware");

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET || "hrshield_jwt_secret_key_2026_super_secure_98765",
        { expiresIn: "7d" }
    );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (or Super Admin)
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, employeeId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email, and password" });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        let employeeRef = null;
        if (employeeId) {
            const emp = await Employee.findOne({ employeeId });
            if (emp) {
                employeeRef = emp._id;
            }
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: role || "EMPLOYEE",
            employeeId,
            employeeRef
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            employeeId: user.employeeId,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error during registration", error: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (user && (await user.matchPassword(password))) {
            if (!user.isActive) {
                return res.status(403).json({ message: "Your account is deactivated. Contact Admin." });
            }

            // Log login audit event
            req.user = user;
            await logAuditTrail({
                req,
                action: "LOGIN_SUCCESS",
                sensitivityLevel: "Public"
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                employeeId: user.employeeId,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login", error: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching profile", error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe
};