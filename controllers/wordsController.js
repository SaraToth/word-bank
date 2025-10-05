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
        
        // Access the word from form (as single object in an array)
        const word = req.body.words[0];

        // Get processed categoryIds (Which always contains default categoryId);
        const categoryIds = req.body.words[0].categoryIds;

        // Check for duplicate
        const existing = await prisma.word.findFirst({
            where: {
                l2Word: word.l2Word, 
                userId: req.userId,
                languageId: req.pairId,
            },
            include: {
                categories: true // fetch existing categories
            }
        });

        if(existing) {
            // Get the categoryIds the word belongs to
            const existingCategoryIds = existing.categories.map(category => category.id);
            // Filter the categorys user wants to add word to
            const missingCategoryIds = categoryIds.filter(
                id => !existingCategoryIds.includes(id)
            );

            // If there are categories that don't have the word add it:
            if (missingCategoryIds.length > 0) {
                await prisma.word.update({
                    where: { id: existing.id},
                    data: {
                        categories: {
                            connect: missingCategoryIds.map(id => ({ id }))
                        }
                    }
                });

            return res.status(200).json({ 
                message: `${word.l2Word} already exists but was succesfully updated with new categories`
            });
            }
        } else {
            // Create the new word
            await prisma.word.create({
                data: {
                    userId: req.userId,
                    languageId: req.pairId,
                    l1Word: word.l1Word,
                    l2Word: word.l2Word,
                    example: word.example || null,
                    categories: {
                        connect: categoryIds.map(id => ({ id }))
                    }
                }
            });

            return res.status(201).json({
                message: `${word.l2Word} was successfully created`
            });
        }

        // When word already exists and has no updates:
        return res.status(200).json({
            message: `${word.l2Word} already exists for those provided categories.`
        });
    })
];

const bulkAddWords = asyncHandler( async(req, res) => {

    // Access the words from form
    const { words } = req.body;

    for (const word of words) {
        const { l1Word, l2Word, example } = word;

        // Check for duplicate
        const existing = await prisma.word.findFirst({
            where: {
                l2Word: l2Word, 
                userId: req.userId,
                languageId: req.pairId,
            },
            include: {
                categories: true // fetch existing categories
            }
        });

        if(existing) {
            // Get the categoryIds the word belongs to
            const existingCategoryIds = existing.categories.map(category => category.id);
            // Filter the categorys user wants to add word to
            const missingCategoryIds = word.categoryIds.filter(
                id => !existingCategoryIds.includes(id)
            );

            // If there are categories that don't have the word add it:
            if (missingCategoryIds.length > 0) {
                await prisma.word.update({
                    where: { id: existing.id},
                    data: {
                        categories: {
                            connect: missingCategoryIds.map(id => ({ id }))
                        }
                    }
                });
            }
            continue // skip creating a new word
        }

        await prisma.word.create({
            data: {
                userId: req.userId,
                languageId: req.pairId,
                l1Word,
                l2Word,
                example: example || null,
                categories: {
                    connect: word.categoryIds.map(id => ({ id }))
                }
            }
        });
    }

    return res.status(200).json({
        message: "Bulk added words succesfully"
    });

});

module.exports = { addWord, bulkAddWords };