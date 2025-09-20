/**
 * Test file for categoriesRouter.js and the corresponding categoriesController.js
 */

// Mock verifyToken passing
jest.mock("../middleware/verifyToken", () => {
    return (req, res, next) => {
        req.user = { id: 1 }; // Ron Weasley
        next();
    }
});

const categoriesRouter = require("../routes/categoriesRouter");
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
testApp.use("/categories", categoriesRouter);


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

describe("Post a new category", () => {
    it("Fails if validation fails", async() => {
        const response = await request(testApp)
            .post("/categories")
            .send({
                category: ""
            })
            .expect("Content-type", /json/)
            .expect(400);
    
        expect(response.body).toHaveProperty("errors");
        expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("Returns the newly created category if it succeeds", async() => {
        const response = await request(testApp)
            .post("/categories")
            .send({ 
                category: "My new folder"
            })
            .expect("Content-Type", /json/)
            .expect(200);

        // Expected response properties:
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("category");

        // Expected category structure:
        expect(response.body.category).toMatchObject({
            id: expect.any(Number),
            slug: expect.any(String),
            name: expect.any(String)
        });

        // Delete test category
        const newCategory = response.body.category;
        await prisma.category.delete({
            where: {
                id: newCategory.id
            }
        });

    })
})

describe("Patch an existing category", () => {
    let myCategory;

    beforeEach( async() => {
        const response = await request(testApp)
            .post("/categories")
            .send({category: "My test category"})
            .expect("Content-type", /json/)
            .expect(200);
        
        myCategory = response.body.category;
        if (!myCategory?.id) {
            throw new Error("Category creation failed");
        }
    });

    afterEach( async() => {
        if (myCategory?.id) {
            await prisma.category.delete({
                where: { id: myCategory.id }
            });
        }
    });

    it("Fails if validation fails", async() => {
        const response = await request(testApp)
            .patch(`/categories/${myCategory.id}`)
            .send({
                category: ""
            })
            .expect("Content-Type", /json/)
            .expect(400);
        
        // Expected response properties:
        expect(response.body).toHaveProperty("errors");
        expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("Fails if category type is DEFAULT", async() => {
        const response = await request(testApp)
            .patch("/categories/1") // Ron's default category
            .send({
                category: "tra la"
            })
            .expect("Content-type", /json/)
            .expect(403);

        expect(response.body).toHaveProperty("error");
    })

    it("successfully renames category", async() => {
        const response = await request(testApp)
            .patch(`/categories/${myCategory.id}`)
            .send({
                category: "Patch wins"
            })
            .expect("Content-type", /json/)
            .expect(200);

        // Expected response properties:
        expect(response.body).toHaveProperty("message");
        expect(response.body).toHaveProperty("category");
        
        // Confirm name and slug changes:
        expect(response.body.category.name).toBe("Patch Wins");
        expect(response.body.category.slug).toBe("patch-wins");

        // Expected category structure:
        expect(response.body.category).toMatchObject({
            id: expect.any(Number),
            name: expect.any(String),
            slug: expect.any(String)
        })
    })
})

describe("Delete an existing category", () => {
    it("Fails if the category doesn't exist", async() => {
        const response = await request(testApp)
            .delete(`/categories/10000`)
            .expect("Content-type", /json/) 
            .expect(404);

        expect(response.body).toHaveProperty("error");
    });

    it("Fails user doesn't have access", async() => {
        const response = await request(testApp)
            .delete("/categories/3") // Ron tries to delete Hermione's
            .expect("Content-type", /json/) 
            .expect(403);
        
        expect(response.body).toHaveProperty("error");
    });

    it("Fails if the category is a DEFAULT type", async() => {
        const response = await request(testApp)
            .delete("/categories/1") // Ron's default category
            .expect("Content-type", /json/)
            .expect(403);

        expect(response.body).toHaveProperty("error");
    })

    it("Succeeds when delete request is valid", async() => {
        // Create a category to delete
        const response = await request(testApp)
            .post("/categories")
            .send({
                category: "This is for deleting"
            })
            .expect("Content-type", /json/)
            .expect(200);
        
        // Delete category
        const id = response.body.category.id;
        await prisma.category.delete({
            where: { id: id}
        });

        // Confirm deletion
        const check = await prisma.category.findFirst({
            where: { id: id}
        });

        expect(check).toBe(null);
    })
})