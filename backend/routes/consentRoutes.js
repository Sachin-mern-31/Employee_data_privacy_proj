const express = require("express");
const router = express.Router();
const { getConsents, updateConsent, getAllConsents } = require("../controllers/consentController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/", getConsents);
router.put("/", updateConsent);
router.get("/all", authorizeRoles("SUPER_ADMIN", "HR_MANAGER"), getAllConsents);

module.exports = router;
