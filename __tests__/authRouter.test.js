/**
 * Test file for authRouter.js and the corresponding authController.js
 */
const authRouter = require("../routes/authRouter");
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
testApp.use("/user", authRouter);

// Test users
const userNick = {
    firstName: "nick",
    lastName: "scratch",
    email: "nick@gmail.com",
    password: "A12thisisme@",
    confirmPassword: "A12thisisme@"
};

const userBella = {
    firstName: "bella",
    lastName: "swan",
    email: "bella@gmail.com",
    password: "A12thisisme@",
    confirmPassword: "A12thisisme@"
}

// Signup Bella as a pre-existing user
beforeEach( async() => {
    await request(testApp)
        .post("/user/signup")
        .send(userBella);
});

// Delete all users in test database
afterAll( async() => {
    await prisma.user.deleteMany({})
});


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
                firstName: "bella",
                lastName: "swan",
                email: "bella@gmail.com",
                password: "A12thisisme@",
                confirmPassword: "A12thisisme@"
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
            email: userBella.email,
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
            email: userBella.email,
            password: userBella.password
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
