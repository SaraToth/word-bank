/**
 * Test file for languagesRouter.js and the corresponding languagesController.js
 */

// Mock verifyToken passing
jest.mock("../middleware/verifyToken", () => {
    return (req, res, next) => {
        req.user = { id: 1 }; // Ron Weasley
        next();
    }
});

const languagesRouter = require("../routes/languagesRouter");
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
testApp.use("/languages", languagesRouter);


describe("GET languageCoes", () => {
    it("Fetches available language codes", async() => {
        const response = await request(testApp)
            .get("/languages")
            .expect("Content-type", /json/)
            .expect(200);

        // Expected response properties
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("codes");

        // Expected codes structure:
        expect(Array.isArray(response.body.codes)).toBe(true);
    })
})
