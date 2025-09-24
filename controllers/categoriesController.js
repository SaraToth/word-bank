const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");
const validateCategory = require("../utils/validateCategory");
const { validationResult } = require("express-validator");
const slugifyText = require("../utils/slugifyText");

// Type definitions
/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
*/

/**
 * Gets a list of user's existing categories
 * 
 * - Verifies user's id and fetches categories from database
 * 
 * @param {Request} req 
 * @param {Response} res
 * @returns {Promise<Response>} JSON response:
 *  - 400: { error: String } - if pairId is not passed in path
 *  - 401 { error: String} - if user's id (from jwt) does not exist
 *  - 404: { error: String } - if the lang pair is not in the db
 *  - 200 { message: String, categories: Object } - request succeeds
 */
const getCategories = asyncHandler(async(req, res) => {

    // Get the list of categories from the database
    const categories = await prisma.category.findMany({
        where: { userId: req.userId, languageId: req.pairId },
        select: { id: true, slug: true, name: true }
    });

    return res.status(200).json({ message: "Categories fetched successfully", categories: categories});
});

/**
 * Gets a specific category for the current user
 * 
 * - Verifies categoryId and fetches it from the database
 * - Confirms the category's userId matches current user
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>} JSON response:
 *  - 401 { error: String} - if user's id (from jwt) does not exist
 *  - 400 { error: String } - when categoryId is not provided, or not a number, or pairId does not match categoryId
 *  - 403 { error: String } - when user doesn't have access to requested category
 *  - 404 { error: String } - when the category doesn't exist in db
 *  - 200 { message: String, categories: Object } - request succeeds
 * @throws {Error} if database look up fails
 */
const getSingleCategory = asyncHandler(async(req, res) => {
    // Access categoryId from request path
    const categoryId = parseInt(req.params.categoryId);

    // categoryId MUST be a number
    if (!categoryId || Number.isNaN(categoryId)) {
        return res.status(400).json({ error: "Bad request" });
    }

    // Find the requested category, and ensure the user owns it
    const category = await prisma.category.findUnique({
        where: {
            id: categoryId,
        },
        select: { id: true, slug: true, name: true, userId: true, languageId: true }
    });

    // Check that the category exists
    if (!category) {
        return res.status(404).json({ error: "Sorry, we can't find that." });
    }

    // Confirm the current user owns that category
    if (category.userId !== req.userId) {
        return res.status(403).json({ error: "Unauthorized. You don't have access to that." });
    }

    // Confirm the category matches current language pair
    if (category.languageId !== req.pairId) {
        return res.status(400).json({ error: "You cannot access a category from a seperate language pair"});
    }

    return res.status(200).json({ 
        message: `Category ${category.name} fetched successfully.`,
        category: {
            id: category.id,
            slug: category.slug,
            name: category.name
        }
    });
});

/**
 * Posts a new category to the database for current user
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>} JSON Response:
 *  - 400 { errors: errors.array()} - Validation fails
 *  - 400 { error: String } - Form input missing after passing validation, or missing pairId
 *  - 401 { error: String } - if user's id (from jwt) does not exist
 *  - 404 { error: String } - language pair doesn't exist in db
 *  - 200 { message: String, category: Object } - request succeeds
 */
const postCategory = [
    validateCategory,

    asyncHandler(async(req, res) => {
        // Handle valiation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }

        // In case empty input passes/skips validation
        const categoryName = req.body.category;
        if (!categoryName) {
            return res.status(400).json({ error: "Category name is required"});
        }

        // Slug the new category
        const slug = slugifyText(categoryName);

        // Create the category
        const category = await prisma.category.create({
            data: {
                type: "CUSTOM",
                name: categoryName,
                slug: slug,
                userId: req.userId,
                languageId: req.pairId
            },
            select: { id: true, slug: true, name: true }
        });

        return res.status(200).json({ 
            message: "New category successfully created",
            category: category
        });
    }
)];

/**
 * Renames the user's existing category
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>} - JSON Response:
 *  - 400 { errors: errors.array()} - validation fails
 *  - 400 { error: String } - no category provide but passes validation, pairId missing, or language pair incorrect
 *  - 401 { error: String } - if user's id (from jwt) does not exist
 *  - 404 { error: String } - language pair doesn't exist in db
 *  - 200 { message: String, category: Object }
 */
const patchCategory = [
    validateCategory,

    asyncHandler(async(req, res) => {
        // Handle valiation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }

        // Access new name, and category's id from request
        const newName = req.body.category;
        const categoryId = parseInt(req.params.categoryId);

        // In case empty input passes/skips validation
        if (!newName) {
            return res.status(400).json({ error: "Category name is required"});
        } else if (!categoryId) {
            return res.status(400).json({ error: "Category id is required" });
        }

        const category = await prisma.category.findUnique({ 
            where: { id: categoryId}
        });

        // Confirm category exists
        if (!category) {
            return res.status(404).json({ error: "Category does not exist" });
        }

        const oldName = category.name;

        // Confirm user has access to that category
        if (category.userId !== req.userId) {
            return res.status(403).json({ error: "Unauthorized. You don't have access to that" });
        }

        // Confirm the category matches language pair
        if (category.languageId !== req.pairId) {
            return res.status(400).json({ error: "Bad request"});
        }

        // Ensure that category is not a default
        if (category.type === "DEFAULT") {
            return res.status(403).json({ error: "Forbidden. Default category 'My Words' cannot be renamed" });
        }

        // Slug the new category
        const slug = slugifyText(newName);

        // Update the category name and slug
        const newCategory = await prisma.category.update({
            where: {id: category.id},
            data: { name: newName, slug: slug },
            select: { id: true, name: true, slug: true }
        });

        return res.status(200).json({ 
            message: `Category successfully renamed ${oldName} to ${newName}`,
            category:  newCategory
        });
    })
];

/**
 * Deletes an existing category for the current user
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>} JSON Response:
 *  - 400: { error: String } - missing pairId from path
 *  - 401: { error: String } - missing userId, 
 *  - 403: { error: String } - unauthorized user, category is type DEFAULT
 *  - 404: { error: String } - missing categoryId from path, lang pair doesn't exist in db
 *  - 200 { message: String } - successful deletion
 */
const deleteCategory = asyncHandler( async(req, res) => {
    const categoryId = parseInt(req.params.categoryId);

    // Confirm categoryId is provided
    if (!categoryId) {
        return res.status(404).json({ error: "Category id is required"});
    }

    // Retrieve category
    const category = await prisma.category.findFirst({
        where: { id: categoryId, languageId: req.pairId }
    });

    // Confirm category exists in db
    if (!category) {
        return res.status(404).json({ error: "Category does not exist"});
    }

    // Confirm user has access
    if (category.userId !== req.userId) {
        return res.status(403).json({ error: "Forbidden. You don't have access"});
    }

    // Confirm the category is not type default
    if (category.type === "DEFAULT") {
        return res.status(403).json({ error: "Forbidden. Default category 'My Words' cannot be deleted"});
    }

    // Delete category
    await prisma.category.delete({
        where: { id: category.id}
    });

    return res.status(200).json({ 
        message: `Deleted ${category.name} successful`
    });
})

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

module.exports = { getCategories, getSingleCategory, postCategory, patchCategory, deleteCategory, getWords };