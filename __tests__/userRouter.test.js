/**
 * Test file for userRouter.js and the corresponding userController.js
 */

// Mock verifyToken passing
jest.mock("../middleware/verifyToken", () => {
    return (req, res, next) => {
        req.user = { id: 1 }; // Ron Weasley
        next();
    }
});

const userRouter = require("../routes/userRouter");
const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const prisma = require("../prisma/client");

// Creates a testApp seperate from app.js
const testApp = express();

// General Middlewares
testApp.use(express.json());
testApp.use(express.urlencoded({ extended: true}));

// Route for testing
testApp.use("/user", userRouter);

// User to test signup
const userNick = {
    firstName: "nick",
    lastName: "scratch",
    email: "nick@gmail.com",
    password: "A12thisisme@",
    confirmPassword: "A12thisisme@"
};

// Existing user to test login
const userHarry = {
    firstName: "Harry",
    lastName: "Potter",
    email: "harry@gmail.com",
    password: "AlphaBeta2@",
    confirmPassword: "AlphaBeta2@"
};


describe("POST signup", () => {
    it("Fails when validation fails", async() => {
        const response = await request(testApp)
        .post("/user/signup")
        .send({
            firstName: "dog"
        })
        .expect("Content-Type", /json/)
        .expect(400);
        
        expect(Array.isArray(response.body.errors)).toBe(true);
        expect(response.body).toHaveProperty("errors");
    });

    it("Fails when the email already exists", async() => {
        const response = await request(testApp)
            .post("/user/signup")
            .send({
                firstName: userHarry.firstName,
                lastName: userHarry.lastName,
                email: userHarry.email,
                password: userHarry.password,
                confirmPassword: userHarry.confirmPassword
            })
            .expect("Content-Type", /json/)
            .expect(400);

        expect(Array.isArray(response.body.errors)).toBe(true);
        expect(response.body).toHaveProperty("errors");
    })

    it("Sucessfully signs up new users", async() => {
        const response = await request(testApp)
        .post("/user/signup")
        .send(userNick)
        .expect("Content-Type", /json/)
        .expect(201);

        expect(response.body).toHaveProperty("message");

        const user = await prisma.user.findUnique({
            where: {
                email: userNick.email
            }
        });

        await prisma.category.deleteMany({
            where: {
                userId: user.id,
            }
        });

        await prisma.user.delete({
            where: {
                id: user.id
            }
        });
        
    })
});

describe("POST login", () => {
    it("Throws an error when validation fails", async() => {
        const response = await request(testApp)
        .post("/user/login")
        .send({
            email: "dog@gmail.com"
        })
        .expect("Content-Type", /json/)
        .expect(400);
        
        expect(Array.isArray(response.body.errors)).toBe(true);
        expect(response.body).toHaveProperty("errors");
    })

    it("Fails if email and password don't match", async() => {
        const response = await request(testApp)
        .post("/user/login")
        .send({
            email: userHarry.email,
            password: "thisisa#33badPassword"
        })
        .expect("Content-Type", /json/)
        .expect(401);

        expect(response.body).toHaveProperty("errors");
    });

    it("Returns a token when it suceeds", async() => {
        const response = await request(testApp)
        .post("/user/login")
        .send({
            email: userHarry.email,
            password: userHarry.password
        })
        .expect("Content-Type", /json/)
        .expect(200);

        // Confirm a token is issued
        expect(response.body).toBeDefined();
        expect(typeof response.body.token).toBe("string");
        expect(response.body.token.length).toBeGreaterThan(0);

        // Decode and confirm token payload
        const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
        expect(decoded.sub).toBeDefined();
        expect(typeof decoded.sub).toBe("number");
    })
})

describe("POST setup language", () => {
    it("Fails when validation data is missing", async() => {
        const response = await request(testApp)
            .post("/user/languages")
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
            .post("/user/languages")
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
            .post("/user/languages")
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
            .post("/user/languages")
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

afterAll(async () => {
  await prisma.$disconnect();
});