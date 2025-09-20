const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");

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
 *  - 403 { error: String } - user requests category owned by a different user
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

    // Find the requested category
    const category = await prisma.category.findUnique({
        where: {
            id: categoryId
        },
        select: { id: true, slug: true, name: true }
    });

    // Confirm the category belongs to current user
    if (category.userId !== userId) {
        return res.status(403).json({ error: "You're not authorized to access that." });
    };

    return res.status(200).json({ 
        message: `Category ${category.name} fetched successfully.`,
        category: category
    });
});

// /**
//  * Creates a new category for current user
//  * 
//  * @param {Request} req 
//  * @param {Response} res
//  * @returns {Promise<Response>} JSON response:
//  */
// const postCategories = (req, res) => {

// };

// /**
//  * Renames one of the user's existing categories
//  * 
//  * @param {Request} req 
//  * @param {Response} res
//  * @returns {Promise<Response>} JSON response:
//  */
// const patchCategories = (req, res) => {

// };

// /**
//  * Deletes a user's category
//  * 
//  * @param {Request} req 
//  * @param {Response} res
//  * @returns {Promise<Response>} JSON response:
//  */
// const deleteCategories = (req, res) => {

// };

module.exports = { getCategories, getSingleCategory };