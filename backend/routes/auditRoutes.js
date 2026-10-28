const express = require("express");
const router = express.Router();
const { getAuditLogs, getAuditStats } = require("../controllers/auditController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.use(protect);
router.use(authorizeRoles("SUPER_ADMIN"));

router.get("/", getAuditLogs);
router.get("/stats", getAuditStats);

module.exports = router;
