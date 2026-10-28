const express = require("express");
const router = express.Router();
const { getSecurityAudit, runSecurityAuditScan } = require("../controllers/securityController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/audit", protect, authorize("SUPER_ADMIN", "HR_MANAGER", "SECURITY_AUDITOR"), getSecurityAudit);
router.post("/audit/run", protect, authorize("SUPER_ADMIN", "SECURITY_AUDITOR"), runSecurityAuditScan);

module.exports = router;
