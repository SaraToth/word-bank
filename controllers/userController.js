const bcrypt = require("bcryptjs");
const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const validateLang = require("../utils/validateLang");
const slugifyText = require("../utils/slugifyText");

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
 * - Creates a new user in the database if valid.
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
 * - 200: { message: "String"} - Login sucessful and bearer token sent to client
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

/**
 * Creates a default category for the user's selected language pair
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>} JSON Response:
 *  - 400 { errors: errors.array()} - validation fails
 *  - 401 { error: String } - userId is missing
 *  - 404 { error: String } - provided lang pair does not exist in db
 * - 200 { message: String, category: Object } - newly created default category
 */
const postUserLanguage = [
    validateLang,

    asyncHandler( async(req, res) => {
        // Handle valiation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }

        // Access language codes from form body
        const { langOne, langTwo } = req.body;

        // Find the lang pair
        const langPair = await prisma.language.findUnique({
            where: {
                l1_l2: {
                    l1: langOne,
                    l2: langTwo
                }
            }
        });

        // Check language pair exists
        if (langPair === null) {
            return res.status(404).json({ error: "Sorry, that language pair is unavailable at this time."});
        }

        // Default category name and slug:
        const defaultName = "My Words";
        const slug = slugifyText(defaultName);
        
        // Creates the default category for that user
        const category = await prisma.category.create({
            data: {
                name: defaultName,
                type: "DEFAULT",
                slug: slug,
                languageId: langPair.id,
                userId: req.userId
            },
            select: {
                id: true, name: true, slug: true
            }
        });

        return res.status(200).json({ 
            message: `New ${langOne} to ${langTwo} succesfully added`,
            category: category
        });
    })
];

const getUserLangs = asyncHandler( async(req, res) => {

    // Default folders exist for each of user's languages
    const langPairs = await prisma.category.findMany({
        where: {
            userId: req.userId,
            type: "DEFAULT",
        },
        select: {
            languageId: true
        }
    });

    // Check there are language pairs
    if (langPairs.length === 0) {
        return res.status(404).json({ error: "No language pairs exist for that user"});
    };

    // Filter only the languageIds
    const languageIds = langPairs.map(pair => pair.languageId);

    return res.status(200).json({ 
        message: "Successfully retrieved user's languageIds",
        languageIds: languageIds});
});

module.exports = { postSignup, postLogin, postUserLanguage, getUserLangs };