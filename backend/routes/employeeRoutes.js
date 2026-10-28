const express = require("express");
const router = express.Router();
const {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    exportEmployeeData
} = require("../controllers/employeeController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/export/data", authorizeRoles("SUPER_ADMIN", "HR_MANAGER"), exportEmployeeData);

router.route("/")
    .get(getEmployees)
    .post(authorizeRoles("SUPER_ADMIN", "HR_MANAGER"), createEmployee);

router.route("/:id")
    .get(getEmployeeById)
    .put(updateEmployee)
    .delete(authorizeRoles("SUPER_ADMIN"), deleteEmployee);

module.exports = router;