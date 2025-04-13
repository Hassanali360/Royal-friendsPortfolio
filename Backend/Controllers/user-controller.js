const User = require("../Models/User-model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const sendLoginAlertEmail = require("./EmailSender.js");

const signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // Validate input fields
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format and password strength
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashpassword = await bcrypt.hash(password, 10);

    // Create a new user
    const createuser = new User({
      fullname,
      email,
      password: hashpassword,
    });

    await createuser.save();

    // Send signup alert email to user and admin
    try {
      if (typeof sendLoginAlertEmail !== "function") {
        throw new Error("sendLoginAlertEmail is not a function");
      }
      await sendLoginAlertEmail({
        name: fullname,
        email: email,
        signupTime: new Date().toISOString(),
        sendToAdmin: true,
      });
      console.log(`Signup alert emails sent to ${email} and ${process.env.OWNER_EMAIL}`);
    } catch (emailError) {
      console.error("Failed to send signup alert emails:", {
        message: emailError.message,
        stack: emailError.stack,
      });
      // Continue signup process even if email fails
    }

    // Send success response
    res.status(201).json({ message: "You have signed up successfully" });
  } catch (error) {
    console.error("Signup error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

const userlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Update login time
    user.loginTime = new Date();
    await user.save();

    // Check for JWT_SECRET_KEY
    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY is not defined in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Send login alert email to user and admin
    try {
      if (typeof sendLoginAlertEmail !== "function") {
        throw new Error("sendLoginAlertEmail is not a function");
      }
      await sendLoginAlertEmail({
        name: user.fullname,
        email: user.email,
        loginTime: user.loginTime.toISOString(),
        sendToAdmin: true,
      });
      console.log(`Login alert emails sent to ${user.email} and ${process.env.OWNER_EMAIL}`);
    } catch (emailError) {
      console.error("Failed to send login alert emails:", {
        message: emailError.message,
        stack: emailError.stack,
      });
    }

    // Send success response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { signup, userlogin };