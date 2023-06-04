require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const PORT = 8000;

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(cors());

app.use("/images", express.static(path.join(__dirname, "public/images")));

app.get("/", (req, res) => {
    res.send("Welcome to Blog_APIs");
});

app.use("/api/user", require("./routes/user"));
app.use("/api/blog", require("./routes/blog"));

app.get("**", (req, res) =>{
    res.status(404).json({error: true, msg: "404 not found!"});
});

app.listen(PORT, () => {
    console.log("Server is running on port:"+PORT);
    console.log("Click here: http://localhost:"+PORT);
});
