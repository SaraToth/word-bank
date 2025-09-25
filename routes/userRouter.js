const { Router } = require("express");
const userRouter = Router();
const verifyToken = require("../middleware/verifyToken");
const confirmLogin = require("../middleware/confirmLogin");
const processLangPair = require("../middleware/processLangPair");
const { postSignup, postLogin, setUpLanguage } = require("../controllers/userController");
const categoriesRouter = require("./categoriesRouter");
const wordsRouter = require("./wordsRouter");

// Routes
userRouter.post("/signup", postSignup);
userRouter.post("/login", postLogin);

// Protect the following routes with authentification
userRouter.use(verifyToken);
userRouter.use(confirmLogin); // passes token's userId to req.userId

// Subroutes:
userRouter.use("/languages/:languagesSlug/categories", processLangPair, categoriesRouter);
userRouter.use("/languages/:languagesSlug/words", processLangPair, wordsRouter);

// Protected Routes
userRouter.post("/languages", setUpLanguage);


module.exports = userRouter;