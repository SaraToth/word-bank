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
testApp.use("/categories", categoriesRouter);

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
            .get("/categories")
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

describe("GET single category", () => {
    it("Gets a single category per the current user's request", async() => {
        const response = await request(testApp)
            .get("/categories/1") // Get Ron Weasley's default category
            .expect("Content-Type", /json/)
            .expect(200);
        
        // Expected response properties:
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("category");

        // Expected structure for category:
        expect(response.body.category).toMatchObject({
            id: expect.any(Number),
            name: expect.any(String),
            slug: expect.any(String)
        });
    });

    it("Fails when provided categoryId is not a number", async() => {
        const response = await request(testApp)
            .get("/categories/abc")
            .expect("Content-Type", /json/)
            .expect(400);

        // Expected response properties:
        expect(response.body).toHaveProperty("error");
    });

    it("Fails when user requests a category they don't own", async() => {
        const response = await request(testApp)
            .get("/categories/3") // Ron is requesting Hermione's category
            .expect("Content-Type", /json/)
            .expect(403);
        
        expect(response.body).toHaveProperty("error");
    });

    it("Fails when user requests a category that doesn't exist", async() => {
        const response = await request(testApp)
            .get("/categories/100") // Does not exist
            .expect("Content-Type", /json/)
            .expect(404);
        
        expect(response.body).toHaveProperty("error");
    });
})