const express = require("express");
const cors = require("cors");
const connectToDb = require("./Database/db");
const userRoutes = require("./Routes/user-routes.js");

const app = express();

// Use CORS middleware
app.use(cors());

// Connect to the database
connectToDb();

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.use("/user", userRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});