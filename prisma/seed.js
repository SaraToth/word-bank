const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
const slugifyText = require("../utils/slugifyText");

const main = async() => {

    const hashedPassword = await bcrypt.hash("AlphaBeta2@", 10);
    const slug = slugifyText("My Words");

    // Create users
    const ron = await prisma.user.create({
        data: {
            firstName: "ron",
            lastName: "weasley",
            email: "ron@gmail.com",
            password: hashedPassword,
        }
    });

    const harry = await prisma.user.create({
        data: {
            firstName: "harry",
            lastName: "potter",
            email: "harry@gmail.com",
            password: hashedPassword,
        }
    });

    const hermione = await prisma.user.create({
        data: {
            firstName: "hermione",
            lastName: "granger",
            email: "hermione@gmail.com",
            password: hashedPassword,
        }
    });

    await prisma.category.createMany({
        data: [
            { type: "DEFAULT", userId: ron.id, name: "My Words", slug: slug },
            { type: "DEFAULT", userId: harry.id, name: "My Words", slug: slug },
            { type: "DEFAULT", userId: hermione.id, name: "My Words", slug: slug }
        ]
    });
};;

main()
    .then(async() => {
        await prisma.$disconnect();
    })
    .catch(async(e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });