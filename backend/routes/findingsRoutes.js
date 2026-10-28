const express = require("express");
const router = express.Router();
const { getFindings, getFindingById, updateFindingRemediation } = require("../controllers/findingsController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/", protect, authorize("SUPER_ADMIN", "HR_MANAGER", "SECURITY_AUDITOR"), getFindings);
router.get("/:id", protect, authorize("SUPER_ADMIN", "HR_MANAGER", "SECURITY_AUDITOR"), getFindingById);
router.put("/:id", protect, authorize("SUPER_ADMIN", "HR_MANAGER", "SECURITY_AUDITOR"), updateFindingRemediation);

module.exports = router;
