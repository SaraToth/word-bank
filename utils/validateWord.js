const { body } = require("express-validator");

const validateWord = [
    body("l1Word")
        .trim()
        .notEmpty()
        .withMessage("You must provide a word")
        .bail()
        .customSanitizer(value => value.replace(/\s+/g, ' ').trim()) // normalizes spaces due to different alphabets
        .matches(/^[\p{L}\s]+$/u) // isAlpha check for ALL alphabets
        .withMessage("Must only contain letters")
        .bail()
        .isLength({ min: 1, max: 50})
        .withMessage("Must be no more than 50 characters long")
        .bail()
        .toLowerCase(), // Normalizes to lower case

    body("l2Word")
        .trim()
        .notEmpty()
        .withMessage("You must provide a word")
        .bail()
        .customSanitizer(value => value.replace(/\s+/g, ' ').trim()) // normalizes spaces due to different alphabets
        .matches(/^[\p{L}\p{Zs}]+$/u) // isAlpha check for ALL alphabets
        .withMessage("Must only contain letters")
        .bail()
        .isLength({ min: 1, max: 50})
        .withMessage("Must be no more than 50 characters long")
        .bail()
        .toLowerCase(), // Normalizes to lower case
    
    body("example")
        .trim()
        .optional({ checkFalsy: true }) // Only validate when its provided
        .customSanitizer(value => value.replace(/\s+/g, ' ').trim()) // normalizes spaces due to different alphabets
        .matches(/^[\p{L}\p{N}\s.,!?:;"'’\-()]+$/u) // isAlpha check for ALL alphabets
        .withMessage("Example must only contain letters, numbers, spaces, and common punctuation")
];

module.exports = validateWord;