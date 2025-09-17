// Creates an instance of prisma to export 
const { PrismaClient } = require("@prisma/client");

// Default NODE_ENV is development
const databaseURL = process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseURL,
        },
    },
});

module.exports = prisma;