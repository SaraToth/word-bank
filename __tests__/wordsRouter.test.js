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
                l1Word: "안녕하세요",
                l2Word: "", // Required data missing
                example: ""
            })
            .expect("Content-type", /json/) 
            .expect(400)

        expect(response.body).toHaveProperty("errors")
        expect(Array.isArray(response.body.errors)).toBe(true);
    })

    it("Succesfully creates a new word", async() => {
        const response = await request(testApp)
            .post("/user/languages/en-kr/categories/1/words")
            .send({
                l1Word: "hello",
                l2Word: "안녕하세요",
                example: "안녕하세요, 저는 세라입니다."
            })
            .expect("Content-type", /json/)
            .expect(200);
        
        // Expected response properties:
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("word");

        // Expected word structure:
        expect(response.body.word).toMatchObject({
            id: expect.any(Number),
            l1Word: expect.any(String),
            l2Word: expect.any(String),
            example: expect.any(String)
        });

        // Delete when test ends
        await prisma.word.delete({
            where: {id: response.body.word.id}
        });
    });

    it("Succesfully creates a new word with no example", async() => {
        const response = await request(testApp)
            .post("/user/languages/en-kr/categories/1/words")
            .send({
                l1Word: "fruit",
                l2Word: "과일",
                example: "" // Empty should be allowed
            })
            .expect("Content-type", /json/)
            .expect(200);
        
        // Expected response properties:
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("word");

        // Expected word structure:
        expect(response.body.word).toMatchObject({
            id: expect.any(Number),
            l1Word: expect.any(String),
            l2Word: expect.any(String),
            example: null
        });
        
        // Delete when test ends
        await prisma.word.delete({
            where: {id: response.body.word.id}
        });
    })
})
afterAll(async () => {
  await prisma.$disconnect();
});
