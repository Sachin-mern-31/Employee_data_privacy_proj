const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        // Flatten allowed roles array
        const roles = allowedRoles.flat();

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Role '${req.user.role}' is not authorized to perform this action.`
            });
        }

        next();
    };
};

const authorize = authorizeRoles;

module.exports = { authorizeRoles, authorize };