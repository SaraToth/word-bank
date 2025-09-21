const { Router } = require("express");
const languagesRouter = Router();
const verifyToken = require("../middleware/verifyToken");
const categoriesRouter = require("../routes/categoriesRouter");
const { setUpLanguage } = require("../controllers/languagesController");
const processLangPair = require("../middleware/processLangPair");
const confirmLogin = require("../middleware/confirmLogin");

// Protect routes with user authentication
languagesRouter.use(verifyToken);
languagesRouter.use(confirmLogin);

languagesRouter.use("/:languagesSlug/categories", processLangPair, categoriesRouter);

// Set up a new language pair for the current user:
languagesRouter.post("/", setUpLanguage);

module.exports = languagesRouter;