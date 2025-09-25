const { Router } = require("express");
const wordsRouter = Router({ mergeParams: true });
const { addWord, bulkAddWords } = require("../controllers/wordsController");
const validateBulkWords = require("../middleware/validateBulkWords");

// Add 1 word
wordsRouter.post("/", addWord);

// Add bulk words
wordsRouter.post("/bulk", validateBulkWords, bulkAddWords);

module.exports = wordsRouter;