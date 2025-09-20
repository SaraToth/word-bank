const { body } = require("express-validator");
const prisma = require("../prisma/client");

const validateCategory = [
    body("category")
        .trim()
        .notEmpty().withMessage("Must enter a name").bail()
        .matches(/^[a-zA-Z0-9 ]+$/).withMessage("Must contain only letters, numbers or spaces")
        .custom(async(value, {req}) => {
            const existingCategory = await prisma.category.findFirst({
                where: {
                    userId: parseInt(req.user.id),
                    name: value
                }
            });

            if (existingCategory) {
                throw new Error("You already have a category with this name");
            }

            return true;
        })
];

module.exports = validateCategory;