const { Router } = require("express");
const wordsRouter = Router({ mergeParams: true });
const verifyToken = require("../middleware/verifyToken");
const { addWord } = require("../controllers/wordsController");

// Protect routes with user authentication
wordsRouter.use(verifyToken);

// Add 1 word
wordsRouter.post("/", addWord);

// Add bulk words

module.exports = wordsRouter;