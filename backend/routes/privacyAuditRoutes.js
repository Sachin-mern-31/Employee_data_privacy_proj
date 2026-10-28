const express = require("express");
const router = express.Router();
const { getPrivacyAudit, runPrivacyAuditScan } = require("../controllers/privacyAuditController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/audit", protect, authorize("SUPER_ADMIN", "HR_MANAGER", "SECURITY_AUDITOR"), getPrivacyAudit);
router.post("/audit/run", protect, authorize("SUPER_ADMIN", "HR_MANAGER", "SECURITY_AUDITOR"), runPrivacyAuditScan);

module.exports = router;
