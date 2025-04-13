const express = require("express");
const router = express.Router();

const nodemailer = require("nodemailer");
const User = require("../Models/User-model");
const validator = require("validator");
const sanitizeHtml = require("sanitize-html");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Validate environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("Error: EMAIL_USER and EMAIL_PASS must be set in .env");
  throw new Error("Missing email configuration");
}

// Email configuration using environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter readiness
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter verification failed:", error.message);
  } else {
    console.log("Email transporter is ready");
  }
});

// Function to retrieve the owner's email from the database
const getOwnerEmail = async () => {
  try {
    const owner = await User.findOne({ role: "owner" });
    if (!owner) {
      console.warn("No user found with role 'owner'");
      return null;
    }
    return owner.email;
  } catch (error) {
    console.error("Error fetching owner email:", {
      message: error.message,
      stack: error.stack,
    });
    return null;
  }
};

// Rate limit middleware for the endpoint
const loginAlertLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per window
  message: "Too many login alert requests, please try again later",
});

// Route to send login alert
router.post("/api/send-login-alert", loginAlertLimiter, async (req, res) => {
  const { name, email, loginTime } = req.body;

  // Validate inputs
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  if (loginTime && !validator.isISO8601(loginTime)) {
    return res.status(400).json({ message: "Invalid loginTime format" });
  }

  try {
    // Fetch the owner's email dynamically
    const ownerEmail = await getOwnerEmail();
    if (!ownerEmail) {
      return res.status(404).json({ message: "Owner email not found" });
    }

    // Sanitize inputs to prevent HTML injection
    const sanitizedName = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
    const sanitizedEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });

    // Use environment variable for subject or default
    const emailSubject = process.env.LOGIN_ALERT_SUBJECT || "🚨 User Logged In";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ownerEmail,
      subject: emailSubject,
      html: `
        <h2>New User Login</h2>
        <p><strong>Name:</strong> ${sanitizedName}</p>
        <p><strong>Email:</strong> ${sanitizedEmail}</p>
        <p><strong>Login Time:</strong> ${loginTime ? new Date(loginTime).toLocaleString() : "Not provided"}</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Login alert email sent to ${ownerEmail} for user ${sanitizedEmail}`, {
      timestamp: new Date().toISOString(),
      userEmail: sanitizedEmail,
    });
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email sending error:", {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack,
    });
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
});

module.exports = router;