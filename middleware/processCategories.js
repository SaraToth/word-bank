const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");
const slugifyText = require("../utils/slugifyText");

const processCategories = asyncHandler( async(req, res, next) => {
    //Access the word from form (as single object in an array)
    const word = req.body.words[0];
    const categoryIds = [];

    const existingCategories = await prisma.category.findMany({
        where: { userId: req.userId, languageId: req.pairId }
    });

    for (const catName of word.categories) {
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

    req.body.words[0].categoryIds = categoryIds;
    next();

    // and then use the categoryIds property in addWord logic!

});

module.exports = processCategories;