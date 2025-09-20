/**
 * Test file for categoriesRouter.js and the corresponding categoriesController.js
 */

const categoriesRouter = require("../routes/categoriesRouter");
const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const prisma = require("../prisma/client");
const verifyToken = require("../middleware/verifyToken");

// Creates a test app seperate from app.js
const testApp = express();

// General Middlewares
testApp.use(express.json());
testApp.use(express.urlencoded({ extended: true}));

// Route for testing
testApp.use("/category", categoriesRouter);

// Mock verifyToken passing
jest.mock("../middleware/verifyToken", () => {
    return (req, res, next) => {
        req.user = { id: 1 }; // Ron Weasley
        next();
    }
});

describe("GET categories", () => {
    it("Gets the categories for current user", async() => {
        const response = await request(testApp)
            .get("/category")
            .expect("Content-Type", /json/)
            .expect(200);
        
        // Expected response properties:
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("categories");

        // Expected structure for each array item in categories:
        expect(response.body.categories[0]).toMatchObject({
            id: expect.any(Number),
            name: expect.any(String),
            slug: expect.any(String)
        });
    })
})