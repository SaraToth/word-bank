const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");

const getLangPair = asyncHandler( async(req, res, next) => {

    // Gets the language pair from path
    const pairId = parseInt(req.params.pairId);

    // Confirm it exists
    if (!pairId || Number.isNaN(pairId)) {
        return res.status(400).json({ error: "Either language pair is missing or invalid"});
    }

    // Access language pair in db
    const langPair = await prisma.language.findUnique({
        where: { id: pairId}
    });

    // Check language pair exists
    if (langPair === null) {
        return res.status(404).json({ message: "Language pair does not exist"});
    }

    req.pairId = langPair.id;

    next();
});

module.exports = getLangPair;