const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");
const slugifyText = require("../utils/slugifyText");

const processBulkCategories = asyncHandler( async(req, res, next) => {
    const existingCategories = await prisma.category.findMany({
        where: { userId: req.userId, languageId: req.pairId }
    });

    req.body.words = await Promise.all(
        req.body.words.map(async word => {
            const categoryIds = [];

            for (const catName of word.categories || []) {

                // Check if category is in-memory
                let category = existingCategories.find(category => category.name === catName);

                if (!category) {
                    // Create category if it doesn't exist
                    category = await prisma.category.create({
                        data: {
                            name: catName,
                            userId: req.userId,
                            languageId: req.pairId,
                            type: "CUSTOM",
                            slug: slugifyText(catName)
                        }
                    });

                    // Add to in-memory list for later words
                    existingCategories.push(category);
                }

                // Add category id to object
                categoryIds.push(category.id);
            }

            // Always include default category
            const defaultCategory = existingCategories.find(category => category.type === "DEFAULT");
            if (!defaultCategory) {
                return res.status(404).json({ error: "Default category not found" });
            }
            categoryIds.push(defaultCategory.id);

            return { ...word, categoryIds};
        })
    );

    next()
});

module.exports = processBulkCategories;