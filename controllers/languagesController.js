const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");
const validateLang = require("../utils/validateLang");
const { validationResult } = require("express-validator");
const toProperNounn = require("../utils/toProperNoun");
const slugifyText = require("../utils/slugifyText");

// Type definitions
/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
*/


/**
 * Creates a default category for the user's selected language pair
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>} JSON Response:
 *  - 400 { errors: errors.array()} - validation fails
 *  - 401 { error: String } - userId is missing
 *  - 404 { error: String } - provided lang pair does not exist in db
 * - 200 { message: String, category: Object } - newly created default category
 */
const setUpLanguage = [
    validateLang,

    asyncHandler( async(req, res) => {
        // Handle valiation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }

        // Access current user id from json web token
        const userId = parseInt(req.user.id);
        if (!userId) {
            return res.status(401).json({ error: "You must be logged in to access that." });
        }

        // Access language codes from form body
        const { langOne, langTwo } = req.body;

        // Find the lang pair
        const langPair = await prisma.language.findUnique({
            where: {
                l1_l2: {
                    l1: langOne,
                    l2: langTwo
                }
            }
        });

        // Check language pair exists
        if (langPair === null) {
            return res.status(404).json({ error: "Sorry, that language pair is unavailable at this time."});
        }

        // Default category name and slug:
        const defaultName = "My Words";
        const slug = slugifyText(defaultName);

        // Creates the default category for that user
        const category = await prisma.category.create({
            data: {
                name: defaultName,
                type: "DEFAULT",
                slug: slug,
                languageId: langPair.id,
                userId: userId
            },
            select: {
                id: true, name: true, slug: true
            }
        });

        return res.status(200).json({ 
            message: `New ${langOne} to ${langTwo} succesfully setup`,
            category: category
        });
    })
];

module.exports = { setUpLanguage };