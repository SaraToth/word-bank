const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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