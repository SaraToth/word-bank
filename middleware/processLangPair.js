const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");


// Type definitions
/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction } NextFunction
*/

/**
 * 
 * @param {Request} req 
 * @param {Response} res
 * @param { NextFunction } next
 * @returns {Promise<Response>} JSON Response:
 *  - 400: { error: String } - if pairId is not passed in path
 *  - 401 { error: String} - if user's id (from jwt) does not exist
 *  - 404: { error: String } - if the lang pair is not in the db
 *  - 200 { message: String, categories: Object } - request succeeds
 */
const processLangPair = asyncHandler( async(req, res, next) => {

    // // Gets the language pair from path
    // const pairId = parseInt(req.params.pairId);

    // Gets the language pair from path and sanitize:
    const { languagesSlug } = req.params;

    // Split into two:
    const [l1, l2] = languagesSlug.toUpperCase().split("-");

    // Confirm it exists
    if (!l1 || !l2) {
        return res.status(400).json({ error: "Missing languages"});
    }

    // Access language pair in db
    const pair = await prisma.language.findUnique({
        where: { l1_l2: {
            l1: l1,
            l2: l2
        }},
    });

    // Check language pair exists
    if (pair === null) {
        return res.status(404).json({ message: "Language pair does not exist"});
    }

    req.pairId = pair.id;

    next();
});

module.exports = processLangPair;