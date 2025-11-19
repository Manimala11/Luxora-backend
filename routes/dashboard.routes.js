const express = require("express");
const { getAdminDashboard } = require("../controllers/dashboard.controller");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, getAdminDashboard);

module.exports = router;