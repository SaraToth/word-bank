const toProperNoun = require("./toProperNoun");
const { body } = require("express-validator");
const prisma = require("../prisma/client");

const validateSignup = [
    body("firstName")
        .trim()
        .notEmpty().withMessage("Must provide your first name.").bail()
        .isAlpha().withMessage("First name must only contain letters.").bail()
        .isLength({ min: 1, max: 50 }).withMessage("First name must be between 1 and 50 characters.")
        .customSanitizer(toProperNoun),

    body("lastName")
        .trim()
        .notEmpty().withMessage("Must provide your last name").bail()
        .isAlpha().withMessage("Last name must only contain letters.").bail()
        .isLength({ min: 1, max: 50 }).withMessage("Last name must be between 1 and 50 characters")
        .customSanitizer(toProperNoun),

    body("email")
        .trim()
        .normalizeEmail()
        .isEmail().withMessage("Must provide a valid email.").bail()
        // Ensure the email is not currently in use
        .custom(async(email) => {
            const existingUser = await prisma.user.findUnique({
                where: {
                    email: email
                },
            });
            if (existingUser) {
                throw new Error("Email is already in use");
            }
        }),

    body("password")
        .trim()
        .notEmpty().withMessage("Must provide a password").bail()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 character long.").bail()
        .matches(/[a-z]/).withMessage("Password must contain at least one lower case letter.").bail()
        .matches(/[A-Z]/).withMessage("Password must contain at least 1 upper case letter.").bail()
        .matches(/[0-9]/).withMessage("Password must contain at least one number.").bail()
        .matches(/[^A-Za-z0-9]/).withMessage("Password must contain at least one special character."),
    
    body("confirmPassword")
        .trim()
        .notEmpty().withMessage("Must type password a second time.").bail()
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match.")
            }
            return true;
        }),
];

module.exports = validateSignup;