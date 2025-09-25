const { Router } = require("express");
const authRouter = Router();
const verifyToken = require("../middleware/verifyToken");
const confirmLogin = require("../middleware/confirmLogin");
const processLangPair = require("../middleware/processLangPair");
const { postSignup, postLogin, setUpLanguage } = require("../controllers/authController");
const categoriesRouter = require("../routes/categoriesRouter");
const wordsRouter = require("../routes/wordsRouter");

// Routes
authRouter.post("/signup", postSignup);
authRouter.post("/login", postLogin);

// Protect the following routes with authentification
authRouter.use(verifyToken);
authRouter.use(confirmLogin); // passes token's userId to req.userId

// Subroutes:
authRouter.use("/languages/:languagesSlug/categories", processLangPair, categoriesRouter);
authRouter.use("/languages/:languagesSlug/words", processLangPair, wordsRouter);

// Protected Routes
authRouter.post("/languages", setUpLanguage);


module.exports = authRouter;