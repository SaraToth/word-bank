const bcrypt = require("bcryptjs");
const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const slugifyText = require("../utils/slugifyText");
const toProperNoun = require("../utils/toProperNoun");

// Type definitions
/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 */

// Form validators
const validateSignup = require("../utils/validateSignup");
const validateLogin = require("../utils/validateLogin");

/**
 * Handles user signup
 * 
 * - Validates user input and returns 400 if validation fails.
 * - Creates a new user in the database and a new default category, if valid.
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>} - JSON response:
 *  - 400: Validation errors
 *  - 201: Successful signup
 * @throws {Error} If password hashing or database insertion fails.
*/
const postSignup = [
    validateSignup,

    asyncHandler(async (req, res) => {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }

        // Parse new user info from form body
        const { firstName, lastName, email, password } = req.body;

        // Hash password for database storage
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is salt#

        // Create new user in database
        const newUser = await prisma.user.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword,
            }
        });

        // Designates a default category, and it's slug
        const defaultCategory = toProperNoun("my words");
        const slug = slugifyText(defaultCategory);

        // Create a default "My words" category in database
        await prisma.category.create({
            data: {
                type: "DEFAULT",
                name: defaultCategory,
                userId: newUser.id,
                slug: slug,
            }
        })

        return res.status(201).json({ message: "New user signup successful"});
    })
];

/**
 * Handles user login
 * 
 * - Validates user input and returns 400 if validation fails.
 * - Signs a json web token to the client if valid.
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>} - JSON response:
 * - 400: { errors: errors.array() } - Validation errors
 * - 400: { errors: "Bad request" } - User not found
 * - 200: { message: ""}
 * @throws {Error} If password hashing or database insertion fails.
 */

/**
 * Handles user login
 * 
 * - Validates user input and returns 400 if validation fails.
 * - Signs a json web token to the client if valid.
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>} - JSON response:
 *  - 400: Validation errors, user doesn't exist
 *  - 401: Password and email don't match
 *  - 200: Successful login, returns { token: string }
 * @throws {Error} If bcrypt password comparison  or database lookup fails.
*/
const postLogin = [
    validateLogin,

    asyncHandler(async(req, res) => {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }

        // Parse email and password from form body
        const { email, password } = req.body;

        // Find user in database
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        // In case the User doesn't exist but passes form validation
        if (!user) {
            return res.status(400).json({ errors: "Bad request" });
        }

        // Check if user-input password matches hashed password in db
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ errors: "Invalid email or password" });
        }

        // Sign a JSON Web Token to the client
        const token = jwt.sign(
            { sub: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1hr" }
        );

        return res.status(200).json({token});

    }),
];

module.exports = { postSignup, postLogin };