const { Router } = require("express");
const wordsRouter = Router({ mergeParams: true });
const verifyToken = require("../middleware/verifyToken");
const { getWords, addWord } = require("../controllers/wordsController");

// Protect routes with user authentication
wordsRouter.use(verifyToken);

wordsRouter.get("/", getWords);
wordsRouter.post("/", addWord);

module.exports = wordsRouter;