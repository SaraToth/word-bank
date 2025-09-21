const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
const slugifyText = require("../utils/slugifyText");

const main = async() => {

    // Creates default language pairs
    await prisma.language.createMany({
        data: [
            { l1: "EN", l2: "KR" }, // Korean
            { l1: "EN", l2: "FR" }, // French
            { l1: "EN", l2: "ES" }, // Spanish
            { l1: "EN", l2: "HU" }, // Hungarian
            { l1: "EN", l2: "JA" }, // Japanese
            { l1: "EN", l2: "ZH" }, // Chinese
        ]
    });

    // Get the language:
    const EngToKr = await prisma.language.findUnique({
        where: { l1_l2: {
            l1: "EN",
            l2: "KR"
        }},
        select: { id: true}
    });

    const hashedPassword = await bcrypt.hash("AlphaBeta2@", 10);
    const slug = slugifyText("My Words");

    // Create users
    const ron = await prisma.user.create({
        data: {
            firstName: "Ron",
            lastName: "Weasley",
            email: "ron@gmail.com",
            password: hashedPassword,
        }
    });

    const harry = await prisma.user.create({
        data: {
            firstName: "Harry",
            lastName: "Potter",
            email: "harry@gmail.com",
            password: hashedPassword,
        }
    });

    const hermione = await prisma.user.create({
        data: {
            firstName: "Hermione",
            lastName: "Granger",
            email: "hermione@gmail.com",
            password: hashedPassword,
        }
    });


    // Create default category for each user to learn Korean
    await prisma.category.createMany({
        data: [
            { type: "DEFAULT", userId: ron.id, name: "My Words", slug: slug, languageId: EngToKr.id },
            { type: "DEFAULT", userId: harry.id, name: "My Words", slug: slug, languageId: EngToKr.id },
            { type: "DEFAULT", userId: hermione.id, name: "My Words", slug: slug, languageId: EngToKr.id }
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