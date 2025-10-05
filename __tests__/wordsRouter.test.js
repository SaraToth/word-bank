/**
 * Test file for wordsRouter.js and the corresponding wordsController.js
 */

// Mock verifyToken passing
jest.mock("../middleware/verifyToken", () => {
    return (req, res, next) => {
        req.user = { id: 1 }; // Ron Weasley
        next();
    }
});

const bulkWords = [
    {
        l1Word: "hello",
        l2Word: "안녕하세요",
        example: "",
        categories: []
    },

    {
        l1Word: "fruit",
        l2Word: "과일",
        example: "",
        categories: []
    }
];

const userRouter = require("../routes/userRouter");
const categoriesRouter = require("../routes/categoriesRouter");
const wordsRouter = require("../routes/wordsRouter");
const request = require("supertest");
const express = require("express");
require("dotenv").config();
const prisma = require("../prisma/client");


// Creates a test app seperate from app.js
const testApp = express();

// General Middlewares
testApp.use(express.json());
testApp.use(express.urlencoded({ extended: true}));

// Route for testing
testApp.use("/user", userRouter);
testApp.use("/user/languages/:pairId/categories", categoriesRouter)
testApp.use("/user/languages/:pairId/categories/:categoryId/words", wordsRouter);

testApp.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

describe("POST add word", () => {
    it("Fails if validation fails", async() => {
        const response = await request(testApp)
            .post("/user/languages/en-kr/categories/1/words")
            .send({
                words: [{
                    l1Word: "안녕하세요",
                    l2Word: "", // Required data missing
                    example: "",
                    categories: []
                }]
            })
            .expect("Content-type", /json/) 
            .expect(400);

            console.log("response", response.body)

        expect(response.body).toHaveProperty("errors")
        expect(Array.isArray(response.body.errors)).toBe(true);
    })

    it("Succesfully creates a new word", async() => {
        const response = await request(testApp)
            .post("/user/languages/en-kr/categories/1/words")
            .send({
                words: [{
                    l1Word: "hello",
                    l2Word: "안녕하세요",
                    example: "안녕하세요, 저는 세라입니다.",
                    categories: []
                }]
            })
            .expect("Content-type", /json/)
            .expect(201);
        
        // Expected response properties:
        expect(response.body).toHaveProperty("message");

        // Get new word
        const newWord = await prisma.word.findFirst({
            where: { l2Word: "안녕하세요", l1Word: "hello", userId: 1}
        });

        // Delete when test ends
        await prisma.word.delete({
            where: { id: newWord.id}
        });
    });

    it("Succesfully creates a new word with no example", async() => {
        const response = await request(testApp)
            .post("/user/languages/en-kr/categories/1/words")
            .send({
                words: [{
                    l1Word: "fruit",
                    l2Word: "과일",
                    example: "", // Empty should be allowed
                    categories: []
                }]
            })
            .expect("Content-type", /json/)
            .expect(201);
        
        // Expected response properties:
        expect(response.body).toHaveProperty("message");
        
        // Get new wordId
        const word = await prisma.word.findFirst({
            where: { l1Word: "fruit", l2Word: "과일"}
        });
        // Delete when test ends
        await prisma.word.delete({
            where: { id: word.id}
        });
    })

    it("Creates a new category if it doesn't exist", async() => {
        const categories = await prisma.category.findMany({
            where: { languageId: 1, userId: 1}
        });
        expect(categories.length).toBe(1);

        const response = await request(testApp)
            .post("/user/languages/en-kr/categories/1/words")
            .send({
                words: [{
                    l1Word: "fruit",
                    l2Word: "과일",
                    example: "", // Empty should be allowed
                    categories: ["food"]
                }]
            })
            .expect("Content-type", /json/)
            .expect(201);
        
        // Success message response:
        expect(response.body).toHaveProperty("message");

        // Access the category that should have been created:
        const newCategory = await prisma.category.findFirst({
            where: { name: "Food"}
        });

        expect(newCategory).toBeDefined();

        // Access newly created word:
        const word = await prisma.word.findFirst({
            where: {
                l1Word: "fruit"
            }
        });

        // Delete the word first
        await prisma.word.delete({
            where: {
                id: word.id
            }
        });

        // Delete the category
        await prisma.category.delete({
            where: {
                id: newCategory.id
            }
        })

    })
})

describe("POST bulk add words", () => {
    it("Succesfully adds words", async() => {
        const response = await request(testApp)
            .post("/user/languages/en-kr/words/bulk")
            .send({
                words: bulkWords
            })
            .expect("Content-type", /json/)
            .expect(200);

        expect(response.body).toHaveProperty("message");
        
        let wordIds = [];
        for (const word of bulkWords) {

            const addedWord = await prisma.word.findFirst({
                where: {
                    userId: 1,
                    l2Word: word.l2Word,
                    l1Word: word.l1Word
                }
            });
            
            if (addedWord) {
                wordIds.push(addedWord.id)
            }
        };

        await prisma.word.deleteMany({
            where: {
                id: { in: wordIds },
            }
        });
    })

    it("Fails if validation fails", async() => {
        const response = await request(testApp)
            .post("/user/languages/en-kr/words/bulk")
            .send({
                words: [
                    {
                        l1Word: "hello",
                        l2Word: "",
                        example: "",
                        categories: []
                    }
                ]
            })
            .expect("Content-type", /json/)
            .expect(400);
        
        expect(response.body).toHaveProperty("errors");
        expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("Creates categories if they don't exist", async() => {
        // Confirm existing category (default)
        const oldCategories = await prisma.category.findMany({
            where: { languageId: 1, userId: 1}
        });
        expect(oldCategories.length).toBe(1);

        const response = await request(testApp)
            .post("/user/languages/en-kr/categories/1/words/bulk")
            .send({
                words: [{
                    l1Word: "tree",
                    l2Word: "나무",
                    example: "",
                    categories: ["nature"]
                },
                {
                    l1Word: "snow",
                    l2Word: "눈",
                    example: "",
                    categories: ["weather", "winter"]
                }
            ]
            })
            .expect("Content-type", /json/)
            .expect(200);

        // Response message:
        expect(response.body).toHaveProperty("message");

        // Get new list of categories:
        const newCategories = await prisma.category.findMany({
            where: { userId: 1, languageId: 1}
        });

        // Confirm categories created:
        expect(newCategories.length).toBe(4)
        expect(newCategories.some(c => c.name === "Weather")).toBe(true);
        expect(newCategories.some(c => c.name === "Nature")).toBe(true);
        expect(newCategories.some(c => c.name === "Winter")).toBe(true);

        // Get newly created words:
        const words = await prisma.word.findMany({
            where: { languageId: 1, userId: 1}  
        });

        // Delete test words:
        await prisma.word.deleteMany({
            where: {
                id: { in: words.map(w => w.id)}
            }
        });

        // Delete test categories:
        await prisma.category.deleteMany({
            where: {
                id: { in: newCategories.map(c => c.id)},
                type: "CUSTOM"
            }
        });
    })
})



afterAll(async () => {
  await prisma.$disconnect();
});
