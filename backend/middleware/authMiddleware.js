const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "hrshield_jwt_secret_key_2026_super_secure_98765"
            );

            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "User account no longer exists" });
            }

            if (!req.user.isActive) {
                return res.status(403).json({ message: "User account has been deactivated" });
            }

            return next();
        } catch (error) {
            console.error("JWT Authorization failed:", error.message);
            return res.status(401).json({ message: "Not authorized, token invalid or expired" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token provided" });
    }
};

module.exports = { protect };
