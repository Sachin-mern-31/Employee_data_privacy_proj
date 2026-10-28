const express = require("express");
const router = express.Router();
const { getDashboardOverview } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.use(protect);
router.use(authorizeRoles("SUPER_ADMIN", "HR_MANAGER"));

router.get("/overview", getDashboardOverview);

module.exports = router;
