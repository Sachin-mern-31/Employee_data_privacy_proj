const SecurityAlert = require("../models/SecurityAlert");

// @desc    Get all active security alerts & notifications
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res) => {
    try {
        const alerts = await SecurityAlert.find().sort({ createdAt: -1 }).limit(50);
        const unreadCount = await SecurityAlert.countDocuments({ isRead: false });

        res.json({
            unreadCount,
            alerts
        });
    } catch (error) {
        console.error("Get Alerts Error:", error);
        res.status(500).json({ message: "Server error fetching security alerts", error: error.message });
    }
};

// @desc    Mark alert as read
// @route   PUT /api/alerts/:id/read
// @access  Private
const markAlertRead = async (req, res) => {
    try {
        const alert = await SecurityAlert.findById(req.params.id);
        if (!alert) return res.status(404).json({ message: "Alert not found" });

        alert.isRead = true;
        alert.readAt = new Date();
        await alert.save();

        res.json(alert);
    } catch (error) {
        res.status(500).json({ message: "Error marking alert read", error: error.message });
    }
};

module.exports = {
    getAlerts,
    markAlertRead
};
