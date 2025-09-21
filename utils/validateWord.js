const { body } = require("express-validator");
const prisma = require("../prisma/client");
const toProperNoun = require("./toProperNoun");

const validateWord = [
    body("l1Word")
        .trim()
        .notEmpty().withMessage("You must provide a word").bail()
        .isAlpha().withMessage("Must only contain letters").bail()
        .isLength({ min: 1, max: 50}).withMessage("Must be no more than 50 characters long").bail()
        .toLowerCase(), // Normalizes to lower case

    body("l2Word")
        .trim()
        .notEmpty().withMessage("You must provide a word").bail()
        .isAlpha().withMessage("Must only contain letters").bail()
        .isLength({ min: 1, max: 50}).withMessage("Must be no more than 50 characters long").bail()
        .toLowerCase(), // Normalizes to lower case
    
    body("example")
        .trim()
        .matches(/^[a-zA-Z0-9 ]+$/).withMessage("Must contain only letters, numbers or spaces")
];