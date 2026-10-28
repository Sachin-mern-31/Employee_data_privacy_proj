const express = require("express");
const router = express.Router();
const { getRisks, createRisk, updateRisk } = require("../controllers/riskController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/", protect, authorize("SUPER_ADMIN", "HR_MANAGER", "SECURITY_AUDITOR"), getRisks);
router.post("/", protect, authorize("SUPER_ADMIN", "SECURITY_AUDITOR"), createRisk);
router.put("/:id", protect, authorize("SUPER_ADMIN", "SECURITY_AUDITOR"), updateRisk);

module.exports = router;
