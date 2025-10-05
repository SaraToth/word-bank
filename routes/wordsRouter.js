const { Router } = require("express");
const wordsRouter = Router({ mergeParams: true });
const { addWord, bulkAddWords } = require("../controllers/wordsController");
const validateBulkWords = require("../middleware/validateBulkWords");
const processCategories = require("../middleware/processCategories");
const processBulkCategories = require("../middleware/proccessBulkCategories");

// Add 1 word
wordsRouter.post("/", processCategories, addWord);

// Add bulk words
wordsRouter.post("/bulk", validateBulkWords, processBulkCategories, bulkAddWords);

module.exports = wordsRouter;