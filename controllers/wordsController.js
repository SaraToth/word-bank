const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const validateWord = require("../utils/validateWord");

const addWord = [
    validateWord,

    asyncHandler( async(req, res) => {
        // Handle valiation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }

        // Access input from form:
        const { l1Word, l2Word, example } = req.body;

        // Confirm l1word doesn't already exist
        const check = await prisma.word.findFirst({
            where: { l1Word: l1Word}
        })
        if (check) {
            return res.status(400).json({ error: "Bad request: that word is already in your dictionary"});
        }

        // Create the new word
        const newWord = await prisma.word.create({
            data: {
                userId: req.userId,
                languageId: req.pairId,
                l1Word: l1Word,
                l2Word: l2Word,
                example: example? example : null,
                categories: {
                    connect: { id: parseInt(req.params.categoryId) }
                }
            },
            select: { id: true, l1Word: true, l2Word: true, example: true }
        });

        return res.status(200).json({
            message: `Succesfully added ${l1Word} to current category`,
            word: newWord
        });
    })
];

module.exports = { addWord };