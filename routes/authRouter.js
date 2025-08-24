const { Router } = require("express");
const authRouter = Router();

const { postSignup, postLogin } = require("../controllers/authController");

// Signup
authRouter.post("/signup", postSignup);

// Login
authRouter.post("/login", postLogin);

module.exports = authRouter;