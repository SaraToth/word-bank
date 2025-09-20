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
 * @param {Request} req 
 * @param {Response} res
 * @returns {Promise<Response>} JSON response:
 */
const getCategories = asyncHandler(async(req, res) => {

    // Access current user id from json web token
    const userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ message: "You must be logged in to access that." });
    }

    // Get the list of categories from the database
    const categories = await prisma.category.findMany({
        where: { userId: userId },
        select: { id: true, slug: true, name: true }
    });

    return res.status(200).json({ message: "Categories fetched successfully", categories: categories});
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

module.exports = { getCategories};