const { Router } = require("express");
const languagesRouter = Router();
const verifyToken = require("../middleware/verifyToken");
const categoriesRouter = require("../routes/categoriesRouter");
const { setUpLanguage } = require("../controllers/languagesController");

// Protect routes with user authentication
languagesRouter.use(verifyToken);

languagesRouter.use("/:pariId/categories", categoriesRouter);

// Set up a new language pair for the current user:
languagesRouter.post("/", setUpLanguage);

module.exports = languagesRouter;