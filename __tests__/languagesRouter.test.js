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

describe("POST setup language", () => {
    it("Fails when validation data is missing", async() => {
        const response = await request(testApp)
            .post("/languages")
            .send({
                langOne: "",
                langTwo: ""
            })
            .expect("Content-type", /json/)
            .expect(400);
        
        // Expected response property and structure:
        expect(response.body).toHaveProperty("errors");
        expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("Fails when user chooses same language", async() => {
        const response = await request(testApp)
            .post("/languages")
            .send({
                langOne: "EN",
                langTwo: "EN"
            })
            .expect("Content-type", /json/)
            .expect(400);
        
            // Expected response property and structure:
            expect(response.body).toHaveProperty("errors");
            expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("Fails when language pair isn't yet offered in db", async() => {
        const response = await request(testApp)
            .post("/languages")
            .send({
                langOne: "FR",
                langTwo: "EN"
            })
            .expect("Content-type", /json/)
            .expect(404);

        expect(response.body).toHaveProperty("error");
    });

    it("Succeeds", async() => {
        const response = await request(testApp)
            .post("/languages")
            .send({
                langOne: "EN",
                langTwo: "FR"
            })
            .expect("Content-type", /json/)
            .expect(200);

        // Expected response properties
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("category");
        
        // Expected category object:
        expect(response.body.category).toMatchObject({
            id: expect.any(Number),
            name: expect.any(String),
            slug: expect.any(String)
        });

        // Expect the default category name:
        expect(response.body.category.name).toBe("My Words");

        // Delete the category from test
        await prisma.category.delete({
            where: { id: response.body.category.id }
        });
    });
});
