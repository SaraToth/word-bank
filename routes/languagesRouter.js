const { Router } = require("express");
const languagesRouter = Router();
const { getLanguageCodes } = require("../controllers/languagesController");

// Gets available language codes
languagesRouter.get("/", getLanguageCodes)


module.exports = languagesRouter;