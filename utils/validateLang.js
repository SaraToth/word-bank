const { body } = require("express-validator");
const prisma = require("../prisma/client");
const toProperNoun = require("./toProperNoun");

const isValidCountryCode = (value) => {
    // CountryCodes as per listed as the enum in prisma schema:
    const countryCodes = [ "KR", "EN", "FR", "HU", "ES", "JA", "ZH" ];

    return countryCodes.includes(value); // Returns true if valid
}

const validateLang = [
    body("langOne")
        .trim()
        .notEmpty().withMessage("Language one cannot be empty").bail()
        .isAlpha().withMessage("Language one must be alphabetic letters").bail()
        .isLength({ min: 2, max: 2 }).withMessage("Language one country code must be 2 characters").bail()
        .toUpperCase()
        .custom((value) => {
            // Ensure country code is valid
            if(!isValidCountryCode(value)) {
                throw new Error("Must provide a valid country code: KR, EN, FR, HU, ES, JA, ZH");
            }

            return true;
        }),
    
    body("langTwo")
        .trim()
        .notEmpty().withMessage("Language two cannot be empty").bail()
        .isAlpha().withMessage("Language two must be alphabetic letters").bail()
        .isLength({ min: 2, max: 2 }).withMessage("Language two country code must be 2 characters").bail()
        .toUpperCase()
        .custom((value, {req}) => {
            // Ensure country code is valid
            if(!isValidCountryCode(value)) {
                throw new Error("Must provide a valid country code: KR, EN, FR, HU, ES, JA, ZH");
            }

            // Ensure both country codes are different
            if (value === req.body.langOne?.toUpperCase()) {
                throw new Error("Language two cannot be the same as language one");
            }
            
            return true;
        })
];

module.exports = validateLang;