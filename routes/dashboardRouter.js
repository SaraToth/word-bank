const { Router } = require("express");
const dashboardRouter = Router();
const verifyToken = require("../middleware/verifyToken");

// Protect all dashboard routes with token authentication
dashboardRouter.use("/", verifyToken);

module.exports = dashboardRouter;