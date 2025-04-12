const express = require('express');
const session = require('express-session');
const app = express();

// Set up session middleware
app.use(session({
  secret: 'your-secret-key',  // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Use `true` in production with HTTPS
}));

// Example login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate the user's credentials (example check, you should query your DB)
  if (email === 'user@example.com' && password === 'password') {
    // If login is successful, store the email in the session
    req.session.user = { email };
    res.send('Login successful');
  } else {
    res.status(401).send('Invalid credentials');
  }
});
