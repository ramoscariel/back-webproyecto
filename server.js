const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const followRoutes = require("./routes/follows");

const app = express();
app.use(cors()); // change this
app.use(bodyParser.json());

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/follows", followRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
