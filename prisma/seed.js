const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const main = async() => {

    const hashedPassword = await bcrypt.hash("AlphaBeta2@", 10);
    // Create users
    await prisma.user.create({
        data: {
            firstName: "ron",
            lastName: "weasley",
            email: "ron@gmail.com",
            password: hashedPassword,
        }
    });

    await prisma.user.create({
        data: {
            firstName: "harry",
            lastName: "potter",
            email: "harry@gmail.com",
            password: hashedPassword,
        }
    });

    await prisma.user.create({
        data: {
            firstName: "hermione",
            lastName: "granger",
            email: "hermione@gmail.com",
            password: hashedPassword,
        }
    });
};

main()
    .then(async() => {
        await prisma.$disconnect();
    })
    .catch(async(e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });