const confirmLogin = (req, res, next) => {
    // Access current user id from json web token
    const userId = parseInt(req.user.id);

    // Confirm userId is not missing
    if (!userId) {
        return res.status(401).json({ error: "You must be logged in to access that." });
    }

    req.userId = userId;
    next();
};

module.exports = confirmLogin;