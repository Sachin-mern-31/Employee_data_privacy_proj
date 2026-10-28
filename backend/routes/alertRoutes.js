const express = require("express");
const router = express.Router();
const { getAlerts, markAlertRead } = require("../controllers/securityAlertController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAlerts);
router.put("/:id/read", protect, markAlertRead);

module.exports = router;
