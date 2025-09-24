const { Router } = require("express");
const authRouter = Router();

const { postSignup, postLogin, setUpLanguage } = require("../controllers/authController");

// Signup
authRouter.post("/signup", postSignup);

// Login
authRouter.post("/login", postLogin);

// Add a language to user
authRouter.post("/languages", setUpLanguage);

module.exports = authRouter;