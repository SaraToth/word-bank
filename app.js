const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const authRouter = require("./routes/authRouter");

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
app.use("/", authRouter);

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