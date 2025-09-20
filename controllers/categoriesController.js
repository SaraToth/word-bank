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
 *  - 401 { error: String} - if user's id (from jwt) does not exist
 *  - 200 { message: String, categories: Object } - request succeeds
 * @throws {Error} if database lookup fails
 */
const getCategories = asyncHandler(async(req, res) => {

    // Access current user id from json web token
    const userId = parseInt(req.user.id);
    if (!userId) {
        return res.status(401).json({ error: "You must be logged in to access that." });
    }

    // Get the list of categories from the database
    const categories = await prisma.category.findMany({
        where: { userId: userId },
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
 *  - 400 { error: String } - when categoryId is not provided, or not a number
 *  - 403 { error: String } - when user doesn't have access to requested category
 *  - 404 { error: String } - when the category doesn't exist in db
 *  - 200 { message: String, categories: Object } - request succeeds
 * @throws {Error} if database look up fails
 */
const getSingleCategory = asyncHandler(async(req, res) => {
    // Access current user id from json web token
    const userId = parseInt(req.user.id);
    if (!userId) {
        return res.status(401).json({ error: "You must be logged in to access that." });
    }

    // Access categoryId from request path
    const categoryId = parseInt(req.params.categoryId);

    // categoryId MUST be a number
    if (!categoryId || Number.isNaN(categoryId)) {
        return res.status(400).json({ error: "Bad request" });
    }

    // Find the requested category, and ensure the user owns it
    const category = await prisma.category.findUnique({
        where: {
            id: categoryId
        },
        select: { id: true, slug: true, name: true, userId: true }
    });

    // Check that the category exists
    if (!category) {
        return res.status(404).json({ error: "Sorry, we can't find that." });
    }

    // Confirm the current user owns that category
    if (category.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized. You don't have access to that." });
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
 *  - 400 { error: String } - Form input missing after passing validation
 *  - 401 { error: String } - if user's id (from jwt) does not exist
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

        // Access current user id from json web token
        const userId = parseInt(req.user.id);
        if (!userId) {
            return res.status(401).json({ error: "You must be logged in to access that." });
        }

        // Slug the new category
        const slug = slugifyText(categoryName);

        // Create the category
        const category = await prisma.category.create({
            data: {
                type: "CUSTOM",
                name: categoryName,
                slug: slug,
                userId: userId
            }
        });

        return res.status(200).json({ 
            message: "New category successfully created",
            category: { id: category.id, slug: category.slug, name: category.name }
        });
    }
)];

module.exports = { getCategories, getSingleCategory, postCategory };