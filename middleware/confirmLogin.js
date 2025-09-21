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
 * @returns {void} JSON Response:
 *  - JSON Respone: 401 { error: String} - if user's id (from jwt) does not exist
 *  - calls Next if userId exists
 *  
 */
const confirmLogin = (req, res, next) => {
    // Access current user id from json web token
    const userId = parseInt(req.user.id);

    // Confirm userId is not missing
    if (!userId) {
        return res.status(401).json({ error: "You must be logged in to access that." });
    }

    req.userId = userId;
    next();
};

module.exports = confirmLogin;