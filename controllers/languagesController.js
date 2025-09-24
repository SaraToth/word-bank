const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");
const validateLang = require("../utils/validateLang");
const { validationResult } = require("express-validator");
const toProperNoun = require("../utils/toProperNoun");
const slugifyText = require("../utils/slugifyText");

// Type definitions
/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
*/




/**
 * Gets all the available language pairs in their code form ex) "EN-KR"
 * 
 * @param {Request} req
 * @param {Response} res
 * @return {Promsie<Response>} JSON Response:
 *  - 404 { error: String } - if no language pairs exist
 *  - 200 { message: String, codes: codes[] } - Returns an array of the sanitized language codes ex) "EN-KR"
 */
const getLanguageCodes = asyncHandler( async(req, res) => {
    
    const pairs = await prisma.language.findMany({
        select: { l1: true, l2: true }
    });

    // Confirm pairs exist
    if (!pairs) {
        return res.status(404).json({ error: "No language pairs are available yet"});
    };
    
    // Sanitize from { l1: "EN", l2: "KR" } TO: "EN-KR"
    const sanitized = pairs.map(p => `${p.l1}-${p.l2}`);

    return res.status(200).json({ 
        message: "Sucessfully fetched available language codes",
        codes: sanitized
    });
});

module.exports = { getLanguageCodes };