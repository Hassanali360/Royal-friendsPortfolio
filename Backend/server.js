const express = require('express');
const cors = require('cors'); // Corrected import for cors
const connectToDb = require('./Database/db'); // Ensure the path is correct
const userRoutes = require('./Routes/user-routes.js');
const app = express();
const session = require('express-session');
const emailRoute = require ("./Routes/Emailroutes.js")

// Use CORS middleware
app.use(cors());

// Connect to the database
connectToDb();

app.use(express.json()); 


// Example login route
// Middleware to parse JSON requests
app.use('/user', userRoutes)
app.use(emailRoute);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
