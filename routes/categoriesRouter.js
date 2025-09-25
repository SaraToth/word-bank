const { Router } = require("express");
const categoriesRouter = Router({ mergeParams: true }); // Access req.params.pairId
const { getCategories, getSingleCategory, postCategory, patchCategory, deleteCategory, getWords } = require("../controllers/categoriesController");

// Routes
categoriesRouter.get("/:categoryId/words", getWords);

categoriesRouter.get("/:categoryId", getSingleCategory);
categoriesRouter.patch("/:categoryId", patchCategory);
categoriesRouter.delete("/:categoryId", deleteCategory);

categoriesRouter.get("/", getCategories);
categoriesRouter.post("/", postCategory);

module.exports = categoriesRouter;