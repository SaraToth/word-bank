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

const categoriesRouter = require("../routes/categoriesRouter");
const wordsRouter = require("../routes/wordsRouter");
const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const prisma = require("../prisma/client");


// Creates a test app seperate from app.js
const testApp = express();

// General Middlewares
testApp.use(express.json());
testApp.use(express.urlencoded({ extended: true}));

// Route for testing
testApp.use("/categories/:categoryId/words", wordsRouter);

describe("GET words", () => {

    it("Gets words", async() => {
        const response = await request(testApp)
            .get("/categories/1/words")
            .expect("Content-type", /json/)
            .expect(200);
        
        // Expected response properties
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("words");

        // Words will be an object (but potentially empty)
        expect(typeof response.body.words).toBe("object");
    });

    it("Fails if category doesn't exist", async() => {
        const response = await request(testApp)
            .get("/categories/10000/words")
            .expect("Content-type", /json/)
            .expect(404);
    
        expect(response.body).toHaveProperty("error");
    })

    // it("Fails if user doesn't have access", async() => {
    //     const response = await request(testApp)
    //         .get("/categories/3/words") // Ron tries to get Hermione's
    //         .expect("Content-type", /json/)
    //         .expect(403);

    //     expect(response.body).toHaveProperty("error");
    // })
}) 

afterAll(async () => {
  await prisma.$disconnect();
});
