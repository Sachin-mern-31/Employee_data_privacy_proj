const express = require("express");
const router = express.Router();
const { getFullAuditReport } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/full", protect, authorize("SUPER_ADMIN", "HR_MANAGER", "SECURITY_AUDITOR"), getFullAuditReport);

module.exports = router;
