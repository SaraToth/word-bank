const { Router } = require("express");
const categoriesRouter = Router({ mergeParams: true }); // Access req.params.pairId
const verifyToken = require("../middleware/verifyToken");
const { getCategories, getSingleCategory, postCategory, patchCategory, deleteCategory, getWords } = require("../controllers/categoriesController");

// Protect routes with user authentication
categoriesRouter.use(verifyToken);

categoriesRouter.get("/:categoryId/words", getWords); // get words for a certain category
categoriesRouter.get("/", getCategories);
categoriesRouter.get("/:categoryId", getSingleCategory);
categoriesRouter.post("/", postCategory);
categoriesRouter.patch("/:categoryId", patchCategory);
categoriesRouter.delete("/:categoryId", deleteCategory);

module.exports = categoriesRouter;