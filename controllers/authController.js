const bcrypt = require("bcryptjs");
const prisma = require("../prisma/client");
const asyncHanlder = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

// Form validators
const validateSignup = require("../utils/validateSignup");


const postSignup = [
    validateSignup,

    asyncHanlder(async (req, res) => {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array});
        }

        // Parse new user info from form body
        const { firstName, lastName, email, password } = req.body;

        // Hash password for database storage
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is salt#

        // Create new user in database
        await prisma.user.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword,
            }
        });

        return res.status(201).json({ message: "New user signup successful"});
    })
];

const postLogin = (req, res) => {

};

module.exports = { postSignup, postLogin };