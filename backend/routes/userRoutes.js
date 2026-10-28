const express = require("express");
const router = express.Router();
const { getUsers, updateUser, getRBACMatrix } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/", protect, authorize("SUPER_ADMIN", "SECURITY_AUDITOR"), getUsers);
router.put("/:id", protect, authorize("SUPER_ADMIN"), updateUser);
router.get("/rbac-matrix", protect, getRBACMatrix);

module.exports = router;
