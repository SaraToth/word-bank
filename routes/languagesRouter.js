const { Router } = require("express");
const languagesRouter = Router();
const verifyToken = require("../middleware/verifyToken");
const { setUpLanguage } = require("../controllers/languagesController");

// Protect routes with user authentication
languagesRouter.use(verifyToken);

languagesRouter.post("/", setUpLanguage);

module.exports = languagesRouter;