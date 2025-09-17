const passport = require("passport");
const jwtStrategy = require("passport-jwt").Strategy;
const extractJWT = require("passport-jwt").ExtractJwt;
const prisma = require("../prisma/client");

const options = {
    jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    new jwtStrategy(options, async (jwt_payload, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                }
            });
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    })
);

module.exports = passport;