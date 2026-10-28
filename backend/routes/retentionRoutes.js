const express = require("express");
const router = express.Router();
const {
    getRetentionStatus,
    updateRetentionPolicy,
    runRetentionScan,
    approveRetentionAction
} = require("../controllers/retentionController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.use(protect);
router.use(authorizeRoles("SUPER_ADMIN"));

router.get("/", getRetentionStatus);
router.put("/policy", updateRetentionPolicy);
router.post("/scan", runRetentionScan);
router.post("/approve", approveRetentionAction);

module.exports = router;
