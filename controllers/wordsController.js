const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const validateWords = require("../utils/validateWords");

const addWord = [
    validateWords,

    asyncHandler( async(req, res) => {
        // Handle valiation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }
        
        // Access input from form:
        const word = req.body.words[0];
        // Access array of categoryIds
        const categoryIds = word.categories;

        // Confirm l2word (foreign language word) doesn't exist already for that user and languagePair
        const check = await prisma.word.findFirst({
            where: { 
                l2Word: word.l2Word, 
                userId: req.userId,
                languageId: req.pairId}
        });
        if (check) {
            return res.status(400).json({ error: "Bad request: that word is already in your dictionary"});
        }

        // Get the default folder for that languagePair
        const defaultCategory = await prisma.category.findFirst({
            where: { 
                userId: req.userId,
                languageId: req.pairId,
                type: "DEFAULT"
            }
        });

        // Add default categoryId
        categoryIds.push(defaultCategory.id);

        // Create the new word
        const newWord = await prisma.word.create({
            data: {
                userId: req.userId,
                languageId: req.pairId,
                l1Word: word.l1Word,
                l2Word: word.l2Word,
                example: word.example? word.example : null,
                categories: {
                    connect: categoryIds.map(id => ({ id }))
                }
            },
            select: { id: true, l1Word: true, l2Word: true, example: true }
        });

        return res.status(200).json({
            message: `Succesfully added ${word.l2Word} to current category`,
            word: newWord
        });
    })
];

module.exports = { addWord };