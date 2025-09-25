const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// Routers
const userRouter = require("./routes/userRouter");
// const categoriesRouter = require("./routes/categoriesRouter");
const languagesRouter = require("./routes/languagesRouter");

// General Middlewares
app.use(
    cors({
        origin: "", // frontend origin
        credentials: true
    })
)
app.use(express.json()) // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/languages", languagesRouter);
// app.use("/categories", categoriesRouter);
app.use("/user", userRouter);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ errorMsg: "Page not found"});
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ errorMsg: err});
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is running on port: ${PORT}`);
});