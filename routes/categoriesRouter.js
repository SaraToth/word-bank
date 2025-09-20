const { Router } = require("express");
const categoriesRouter = Router();
const verifyToken = require("../middleware/verifyToken");
const { getCategories, getSingleCategory, postCategory, patchCategory } = require("../controllers/categoriesController");

// Protect routes with user authentication
categoriesRouter.use(verifyToken);

categoriesRouter.get("/", getCategories);
categoriesRouter.get("/:categoryId", getSingleCategory);
categoriesRouter.post("/", postCategory);
categoriesRouter.patch("/:categoryId", patchCategory);
// categoriesRouter.delete("/:categoryId", deleteCategory);

module.exports = categoriesRouter;