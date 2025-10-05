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

// Routes needed for mocking
const categoriesRouter = require("../routes/categoriesRouter");
const wordsRouter = require("../routes/wordsRouter");
const userRouter = require("../routes/userRouter");

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
testApp.use("/user/languages/:languagesSlug/categories", categoriesRouter);
testApp.use("/user/languages/:languagesSlug/words", wordsRouter);


describe("GET categories", () => {
    it("Gets the categories for current user", async() => {
        const response = await request(testApp)
            .get("/user/languages/en-kr/categories")
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
            .get("/user/languages/en-kr/categories/1") // Get Ron Weasley's default category
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
            .get("/user/languages/en-kr/categories/abc")
            .expect("Content-Type", /json/)
            .expect(400);

        // Expected response properties:
        expect(response.body).toHaveProperty("error");
    });

    it("Fails when user requests a category they don't own", async() => {
        const response = await request(testApp)
            .get("/user/languages/en-kr/categories/3") // Ron is requesting Hermione's category
            .expect("Content-Type", /json/)
            .expect(403);
        
        expect(response.body).toHaveProperty("error");
    });

    it("Fails when user requests a category that doesn't exist", async() => {
        const response = await request(testApp)
            .get("/user/languages/en-kr/categories/100") // Does not exist
            .expect("Content-Type", /json/)
            .expect(404);
        
        expect(response.body).toHaveProperty("error");
    });

    it("Fails when category id is not associated with the pairId", async() => {
        const response = await request(testApp)
            .get("/user/languages/en-fr/categories/1")
            .expect("Content-type", /json/)
            .expect(400);

        expect(response.body).toHaveProperty("error");
    })
})

describe("Post a new category", () => {
    it("Fails if validation fails", async() => {
        const response = await request(testApp)
            .post("/user/languages/en-kr/categories")
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
            .post("/user/languages/en-kr/categories")
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
            .post("/user/languages/en-kr/categories")
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
            .patch(`/user/languages/en-kr/categories/${myCategory.id}`)
            .send({
                category: ""
            })
            .expect("Content-Type", /json/)
            .expect(400);
        
        // Expected response properties:
        expect(response.body).toHaveProperty("errors");
        expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it("Fails if language pair is not a match", async() => {
        const response = await request(testApp)
            .patch(`/user/languages/en-fr/categories/${myCategory.id}`)
            .send({
                category: "Patch wins"
            })
            .expect("Content-type", /json/)
            .expect(400);

        expect(response.body).toHaveProperty("error");
    })

    it("Fails if category type is DEFAULT", async() => {
        const response = await request(testApp)
            .patch("/user/languages/en-kr/categories/1") // Ron's default category
            .send({
                category: "tra la"
            })
            .expect("Content-type", /json/)
            .expect(403);

        expect(response.body).toHaveProperty("error");
    })

    it("successfully renames category", async() => {
        const response = await request(testApp)
            .patch(`/user/languages/en-kr/categories/${myCategory.id}`)
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
            .delete(`/user/languages/en-kr/categories/10000`)
            .expect("Content-type", /json/) 
            .expect(404);

        expect(response.body).toHaveProperty("error");
    });

    it("Fails user doesn't have access", async() => {
        const response = await request(testApp)
            .delete("/user/languages/en-kr/categories/3") // Ron tries to delete Hermione's
            .expect("Content-type", /json/) 
            .expect(403);
        
        expect(response.body).toHaveProperty("error");
    });

    it("Fails if the category is a DEFAULT type", async() => {
        const response = await request(testApp)
            .delete("/user/languages/en-kr/categories/1") // Ron's default category
            .expect("Content-type", /json/)
            .expect(403);

        expect(response.body).toHaveProperty("error");
    })

    it("Succeeds when delete request is valid", async() => {
        // Create a category to delete
        const response = await request(testApp)
            .post("/user/languages/en-kr/categories")
            .send({
                category: "cookie"
            })
            .expect("Content-type", /json/)
            .expect(200);
        
        expect(response.body.category.name).toBe("Cookie");

        // Get category id
        const id = response.body.category.id;

        await request(testApp)
            .delete(`/user/languages/en-kr/categories/${id}`)
            .expect("Content-type", /json/)
            .expect(200);

        // Confirm deletion
        const check = await prisma.category.findFirst({
            where: { id: id}
        });

        expect(check).toBe(null);
    })

    it("Succeeds and retains existing words", async() => {
        // Create a category to delete
        await request(testApp)
            .post("/user/languages/en-kr/categories")
            .send({
                category: "nature"
            })
            .expect("Content-type", /json/)
            .expect(200);

        // Access that category
        const category = await prisma.category.findFirst({
            where: { userId: 1, name: "Nature"}
        });
        
        // Post words to that category
        await request(testApp)
            .post(`/user/languages/en-kr/words/bulk`)
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
                    categories: ["nature"]
                }
            ]
            })
            .expect("Content-type", /json/)
            .expect(200);

        // Delete the category "Nature"
        const response = await request(testApp)
            .delete(`/user/languages/en-kr/categories/${category.id}`);
        
        // Expect response body property:
        expect(response.body).toHaveProperty("message");

        // Access the added words
        const words= await prisma.word.findMany({
            where: { languageId: 1, userId: 1}
        });

        // Ensure they still exist (under default category)
        expect(words.length).toBeGreaterThan(0);

        // Delete the test words
        await prisma.word.deleteMany({
            where: {
                id: { in: words.map(w => w.id)}
            }
        })
    })
})

describe("GET words", () => {

    it("Gets words", async() => {
        const response = await request(testApp)
            .get("/user/languages/en-kr/categories/1/words")
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
            .get("/user/languages/en-kr/categories/10000/words")
            .expect("Content-type", /json/)
            .expect(404);
    
        expect(response.body).toHaveProperty("error");
    })

}) 

afterAll(async () => {
  await prisma.$disconnect();
});