const { body } = require("express-validator");
const prisma = require("../prisma/client");

const validateLogin = [
    body("email")
        .trim()
        .notEmpty().withMessage("Must provide your email address.").bail()
        .normalizeEmail()
        .isEmail().withMessage("Must provide a valid email address.").bail()
        // Ensures the email/account exists
        .custom(async(email) => {
            const user = await prisma.user.findUnique({
                where: {
                    email: email
                },
            });
            if (!user) {
                throw new Error("There is no account associated with that email address.");
            }
            return true;
        }),
    body("password")
        .trim()
        .notEmpty().withMessage("Must enter a password"),
];

module.exports = validateLogin;