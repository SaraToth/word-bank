const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const validateWords = require("../utils/validateWords");

const validateBulkWords = [
    validateWords,

    asyncHandler( async(req, res, next) => {
        // Handle valiation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }

        next();
    })
];

module.exports = validateBulkWords;