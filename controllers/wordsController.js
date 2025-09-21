const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const validateWord = require("../utils/validateWord");
const slugifyText = require("../utils/slugifyText");

const getWords = asyncHandler( async(req, res) => {
    
    // Access categoryId from the path
    const categoryId = parseInt(req.params.categoryId);
    
    // Confirm categoryId is provided
    if (!categoryId) {
        return res.status(400).json({ error: "Category id must be provided"});
    }

    // Find category in db
    const category = await prisma.category.findUnique({
        where: { id: categoryId}
    });

    // Confirm category exists
    if (category === null) {
        return res.status(404).json({ error: "Category doesn't exist"});
    }

    console.log("user is", req.userId);

    // Confirm user has access
    if (category.userId !== req.userId) {
        return res.status(403).status({ error: "Unauthroized. You don't have access to that"});
    }

    // Access words from that category from the db
    const words = await prisma.word.findMany({
        where: { 
            languageId: req.pairId,
            userId: req.userId,
            categories: {
                some: {
                    id: categoryId
                }
            }
        },
        select: { id: true, l1Word: true, l2Word: true, example: true}
    });

    return res.status(200).json({ 
        message: `Words succesfully retrieved for ${category.name}`,
        words: words
    });
    
})

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

module.exports = { getWords, addWord };