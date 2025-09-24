const { Router } = require("express");
const languagesRouter = Router();
const verifyToken = require("../middleware/verifyToken");
const categoriesRouter = require("../routes/categoriesRouter");
const { setUpLanguage, getLanguageCodes } = require("../controllers/languagesController");
const processLangPair = require("../middleware/processLangPair");
const confirmLogin = require("../middleware/confirmLogin");
const wordsRouter = require("./wordsRouter");

// Protect routes with user authentication
languagesRouter.use(verifyToken);
languagesRouter.use(confirmLogin);

// Subroutes:
languagesRouter.use("/:languagesSlug/categories", processLangPair, categoriesRouter);
languagesRouter.use("/:languagesSlug/words", wordsRouter);

languagesRouter.get("/", getLanguageCodes)
languagesRouter.post("/", setUpLanguage);

module.exports = languagesRouter;