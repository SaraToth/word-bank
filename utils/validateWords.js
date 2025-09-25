const { body } = require("express-validator");

const validateWords = [
    body("words").isArray().withMessage("Words must be an array"),

    body("words.*.l1Word")
        .isString("l1Word must be a string").
        bail()
        .trim()
        .notEmpty()
        .withMessage("You must provide a word")
        .bail()
        .customSanitizer(value => value.replace(/\s+/g, ' ').trim()) // normalizes spaces due to different alphabets
        .matches(/^[\p{L}\p{Zs}-]+$/u) // isAlpha check for ALL alphabets
        .withMessage("Must only contain letters")
        .bail()
        .isLength({ min: 1, max: 50})
        .withMessage("Must be no more than 50 characters long")
        .bail()
        .toLowerCase(), // Normalizes to lower case

    body("words.*.l2Word")
        .isString().withMessage("l2Word must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("You must provide a word")
        .bail()
        .customSanitizer(value => value.replace(/\s+/g, ' ').trim()) // normalizes spaces due to different alphabets
        .matches(/^[\p{L}\p{Zs}-]+$/u) // isAlpha check for ALL alphabets
        .withMessage("Must only contain letters")
        .bail()
        .isLength({ min: 1, max: 50})
        .withMessage("Must be no more than 50 characters long")
        .bail()
        .toLowerCase(), // Normalizes to lower case
    
    body("words.*.example")
        .optional({ checkFalsy: true }) // Only validate when its provided
        .isString("Example sentence must be a string")
        .bail()
        .trim()
        .customSanitizer(value => value.replace(/\s+/g, ' ').trim()) // normalizes spaces due to different alphabets
        .matches(/^[\p{L}\p{N}\p{M}\s.,!?:;"'’\-(){}[\]<>«»„“”、。？！・…〜ー]+$/u) // isAlpha check for ALL alphabets
        .withMessage("Example must only contain letters, numbers, spaces, and common punctuation"),

    body("words.*.categories")
        .optional({ checkFalsy: true }) // Only validate when provided
        .isArray().withMessage("Categories must be an array of strings"),

    body("words.*.categories.*")
        .isString().withMessage("Each category must be a string")
        .bail()
        .trim()
        .notEmpty().withMessage("Category cannot be empty")
];

module.exports = validateWords;