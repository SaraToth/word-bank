const prisma = require("../prisma/client");

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
const getCategories = (req, res) => {

};

/**
 * Creates a new category for current user
 * 
 * @param {Request} req 
 * @param {Response} res
 * @returns {Promise<Response>} JSON response:
 */
const postCategories = (req, res) => {

};

/**
 * Renames one of the user's existing categories
 * 
 * @param {Request} req 
 * @param {Response} res
 * @returns {Promise<Response>} JSON response:
 */
const patchCategories = (req, res) => {

};

/**
 * Deletes a user's category
 * 
 * @param {Request} req 
 * @param {Response} res
 * @returns {Promise<Response>} JSON response:
 */
const deleteCategories = (req, res) => {

};

module.exports = { getCategories, postCategories, patchCategories, deleteCategories };