const { Router } = require("express");
const authRouter = Router();
const verifyToken = require("../middleware/verifyToken");

const { postSignup, postLogin, setUpLanguage } = require("../controllers/authController");
const confirmLogin = require("../middleware/confirmLogin");

// Signup
authRouter.post("/signup", postSignup);

// Login
authRouter.post("/login", postLogin);

// Add a language to user
authRouter.use(verifyToken);
authRouter.use(confirmLogin);
authRouter.post("/languages", setUpLanguage);

module.exports = authRouter;