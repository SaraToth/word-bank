const { Router } = require("express");
const categoriesRouter = Router({ mergeParams: true }); // Access req.params.pairId
const verifyToken = require("../middleware/verifyToken");
const { getCategories, getSingleCategory, postCategory, patchCategory, deleteCategory } = require("../controllers/categoriesController");
const wordsRouter = require("./wordsRouter");

// Protect routes with user authentication
categoriesRouter.use(verifyToken);

// Subroute for words
categoriesRouter.use("/:categoryId/words", wordsRouter);

categoriesRouter.get("/", getCategories);
categoriesRouter.get("/:categoryId", getSingleCategory);
categoriesRouter.post("/", postCategory);
categoriesRouter.patch("/:categoryId", patchCategory);
categoriesRouter.delete("/:categoryId", deleteCategory);

module.exports = categoriesRouter;