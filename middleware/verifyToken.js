const passport = require("../config/passport");

const verifyToken = passport.authenticate("jwt", { session: false });

module.exports = verifyToken;